// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;

using A2v10.Request;

namespace A2v10.Web.Mvc.Controllers
{ 
	[Authorize]
	public class EuSignController : Controller
	{
		A2v10.Request.BaseController _baseController = new BaseController();

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
		public ActionResult LoadRaw(String Id)
		{
			return File("~/_test/testfile.pdf", "application/octet-stream");
		}

		[HttpPost]
		public ActionResult SaveRaw(String Id)
		{
			return new EmptyResult();
		}
	}
}
