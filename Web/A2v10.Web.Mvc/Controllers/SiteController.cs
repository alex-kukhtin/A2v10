// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;


namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	public class SiteController : Controller
	{
		private readonly A2v10.Request.SiteController _siteController = new A2v10.Request.SiteController();

		public async Task<ActionResult> Default(String pathInfo)
		{
			try
			{
				if (await _siteController.ProcessRequest(pathInfo, Request, Response))
					return null;

				var viewInfo = await _siteController.LoadView(pathInfo);
				return View(viewInfo.View, viewInfo);
			}

			catch (Exception ex)
			{
				_siteController.WriteExceptionStatus(ex, Response);
			}
			return null;
		}
	}
}
