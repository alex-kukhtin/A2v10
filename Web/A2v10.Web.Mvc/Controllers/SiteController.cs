// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;

using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	public class SiteController : Controller
	{
		private readonly A2v10.Request.SiteController _siteController = new A2v10.Request.SiteController();

		public async Task Default(String pathInfo)
		{
			var path = pathInfo;
			if (String.IsNullOrEmpty(path))
				path = "index";
			await _siteController.Render($"/_page/{path}/index/id", Response);
		}
	}
}
