// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;
using System.Web.Mvc;

using Microsoft.AspNet.Identity;

using A2v10.Request;
using A2v10.Web.Identity;
using A2v10.Infrastructure;
using System.IO;
using System.Web;
using System.Net.Http;

namespace A2v10.Web.Mvc.Controllers
{ 
	[Authorize]
	public class EuSignController : Controller
	{
		A2v10.Request.BaseController _baseController = new BaseController();

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();

		[HttpGet]
		public void Index(String Id, String Base)
		{
			Response.ContentType = "text/html";
			_baseController.RenderEUSignDialog(Response.Output, Id, Base);
		}

		[HttpGet]
		public void Frame(String Id, String Base)
		{
			Response.ContentType = "text/html";
			_baseController.RenderEUSignFrame(Response.Output, Id, Base);
		}

		[HttpPost]
		public async Task LoadRaw(String Id, String Base)
		{
			var url = $"/_attachment{Base}/{Id}";
			var ai = await _baseController.DownloadAttachment(url, SetParams);
			if (ai == null)
				throw new RequestModelException($"Attachment not found. (Id:{Id})");
			Response.ContentType = "application/octet-stream";
			Response.BinaryWrite(ai.Stream);
		}

		[HttpPost]
		public async Task SaveSignature(String Id, String Base)
		{
			Response.ContentType = "text/plain";
			try
			{
				if (Request.Files.Count != 1)
					throw new RequestModelException("There is no file here");
				var stream = Request.Files[0].InputStream;
				// save signature
				Response.Output.Write("success");
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Output.WriteLine($"error: {ex.Message}");
			}
		}

		void SetParams(ExpandoObject prms)
		{
			prms.Set("UserId", UserId);
			prms.Set("TenantId", TenantId);
		}

	}
}
