// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Dynamic;
using System.Net.Http.Headers;

using Microsoft.AspNet.Identity;

using A2v10.Request;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Identity;
using A2v10.Infrastructure;
using System.Globalization;
using Newtonsoft.Json;

namespace A2v10.Web.Mvc.Controllers
{
	[Authorize]
	[ExecutingFilter]

	public class AttachmentController : Controller
	{
		A2v10.Request.BaseController _baseController = new BaseController();

		public AttachmentController()
		{
		}

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();

		[HttpGet]
		public async Task Show(String Base, String id)
		{
			try
			{
				var url = $"/_attachment{Base}/{id}";
				var ai = await _baseController.DownloadAttachment(url, SetParams);
				if (ai == null)
					throw new RequestModelException($"Attachment not found. (Id:{id})");
				Response.ContentType = ai.Mime;
				Response.BinaryWrite(ai.Stream);
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}

		[HttpGet]
		public Task Export(String Base, String id)
		{
			return Download(Base, id, false);
		}

		[HttpPost]
		public Task Raw(String Base, String id)
		{
			return Download(Base, id, true);
		}

		[HttpPost]
		public async Task Signature(String Base, String id)
		{
			try
			{
				var url = $"/_attachment{Base}/{id}";
				var si = await _baseController.DownloadSignature(url, SetParams);
				if (si == null)
					throw new RequestModelException($"Signature not found. (Id:{id})");

				Response.ContentType = "application/octet-stream";
				Response.BinaryWrite(si.Stream);
			}
			catch (Exception ex)
			{
				_baseController.WriteExceptionStatus(ex, Response);
			}
		}

		async Task Download(String Base, String id, Boolean raw)
		{ 
			try
			{
				var url = $"/_attachment{Base}/{id}";
				var ai = await _baseController.DownloadAttachment(url, SetParams);
				if (ai == null)
					throw new RequestModelException($"Attachment not found. (Id:{id})");

				if (raw)
				{
					Response.ContentType = "application/octet-stream";
				}
				else
				{
					Response.ContentType = raw ? "application/octet-stream" : ai.Mime;
					String repName = ai.Name;
					if (String.IsNullOrEmpty(repName))
						repName = "Attachment";
					var cdh = new ContentDispositionHeaderValue("attachment")
					{
						FileNameStar = _baseController.Localize(repName) + Mime2Extension(ai.Mime)
					};
					Response.Headers.Add("Content-Disposition", cdh.ToString());
				}
				Response.BinaryWrite(ai.Stream);
			}
			catch (Exception ex)
			{
				if (raw)
					_baseController.WriteExceptionStatus(ex, Response);
				else
					_baseController.WriteHtmlException(ex, Response.Output);
			}
		}

		[HttpPost]
		public async Task Sign(String Base, String id)
		{
			try
			{
				var url = $"/_attachment{Base}/{id}";
				if (Request.Files.Count != 1)
					throw new RequestModelException("There is no file here");
				var stream = Request.Files[0].InputStream;
				// save signature
				//subjCN, issuer, serial, time
				var prms = new ExpandoObject();
				SetParams(prms);

				String strTime = Request.Form["time"];
				if (strTime != null)
				{
					var time = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
					time = time.AddMilliseconds(Double.Parse(strTime));
					prms.Set("Time", time);
				}

				prms.Set("Stream", stream);
				prms.Set("Issuer", Request.Form["issuer"]);
				prms.Set("Serial", Request.Form["serial"]);
				prms.Set("Subject", Request.Form["subjCN"]);
				prms.Set("Kind", Request.Form["kind"]);

				var ri = await _baseController.SaveSignature(url, prms);

				Response.ContentType = "application/json";
				Response.Write(JsonConvert.SerializeObject(new { status = "success", id = ri.Id }));
			}
			catch (Exception ex)
			{
				_baseController.WriteExceptionStatus(ex, Response);
			}
		}

		String Mime2Extension(String mime)
		{
			if (mime.ToLowerInvariant().EndsWith("pdf"))
				return ".pdf";
			return String.Empty;
		}

		void SetParams(ExpandoObject prms)
		{
			prms.Set("UserId", UserId);
			prms.Set("TenantId", TenantId);
		}
	}
}
