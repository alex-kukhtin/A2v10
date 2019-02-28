// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Web.Mvc;
using System.Threading.Tasks;
using System.IO;
using System.Dynamic;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Request;
using A2v10.Interop;
using Microsoft.AspNet.Identity;
using System.Security.Claims;
using System.Security.Principal;
using A2v10.Infrastructure;
using System.Web;

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	public class StaticController : Controller
	{
		IApplicationHost _host;

		public StaticController()
		{
			_host = ServiceLocator.Current.GetService<IApplicationHost>();
		}


		[HttpGet]
		public void Default(String pathInfo)
		{
			try
			{
				pathInfo = pathInfo.ToLowerInvariant();
				if (pathInfo.IndexOf('.') == -1)
					pathInfo = Path.ChangeExtension(pathInfo, "html"); // no extension -> .html
				var path = _host.ApplicationReader.MakeFullPath("_static/", pathInfo);
				if (!_host.ApplicationReader.FileExists(path))
					throw new FileNotFoundException($"File not found '{pathInfo}'");
				Response.ContentType = MimeMapping.GetMimeMapping(path);
				using (var stream = _host.ApplicationReader.FileStreamFullPath(path))
				{
					stream.CopyTo(Response.OutputStream);
				}
			}
			catch (Exception ex)
			{
				Response.ContentType = "text/plain";
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write(ex.Message);
			}
		}
	}
}
