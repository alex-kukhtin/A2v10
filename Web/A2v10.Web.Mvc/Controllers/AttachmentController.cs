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
				_baseController.WriteHtmlException(ex, Response.Output);
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
