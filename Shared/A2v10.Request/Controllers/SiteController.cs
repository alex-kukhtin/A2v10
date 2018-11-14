// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Request
{
	public class SiteController
	{
		BaseController _baseController = new BaseController();

		public SiteController()
		{
		}

		public String NormalizeUrl(String url)
		{
			if (String.IsNullOrEmpty(url))
				return "index/index/0";
			var urlSegments = url.Split('/');
			if (urlSegments.Length == 1)
				return url + "/index/0";
			return url;
		}

		public async Task<ViewInfo> LoadView(String pathInfo)
		{
			var host = _baseController.Host;
			var rm = await RequestModel.CreateFromUrl(host, false, RequestUrlKind.Page, NormalizeUrl(pathInfo));
			var rw = rm.GetCurrentAction();
			var loadPrms = new ExpandoObject();
			var pageId = $"el{Guid.NewGuid()}";
			var dmrw = await _baseController.GetDataModelForView(rw, loadPrms);
			rw = dmrw.RequestView;
			var viewInfo = new ViewInfo()
			{
				PageId = pageId,
				View = $"~/App_apps/{host.AppKey}/{rw.Path}/{rw.GetView()}.cshtml",
				DataModel = dmrw.Model
			};
			viewInfo.Script = await _baseController.GetModelScriptModel(rw, viewInfo.DataModel, pageId);
			return viewInfo;
		}

		public async Task Render(String pathInfo, HttpResponseBase Response)
		{
			var host = _baseController.Host;
			var rm = await RequestModel.CreateFromBaseUrl(host, false, pathInfo);
			var rw = rm.GetCurrentAction();
			var layout = host.MakeFullPath(false, String.Empty, "layout.html");
			if (!System.IO.File.Exists(layout))
				throw new FileNotFoundException(layout);
			String body = host.MakeFullPath(false, rw.Path, $"{rw.GetView()}.html");
			if (!System.IO.File.Exists(body))
				throw new FileNotFoundException(body);
			String script = String.Empty;
			if (!String.IsNullOrEmpty(rw.script))
			{
				String jsfile = host.MakeFullPath(false, rw.Path, $"{rw.script}.js");
				if (!System.IO.File.Exists(jsfile))
					throw new FileNotFoundException(jsfile);
				var sb = new StringBuilder("<script type=\"text/javascript\">")
					.AppendLine("'use strict';\n(function() {" )
					.AppendLine(System.IO.File.ReadAllText(jsfile))
					.AppendLine("})();")
					.AppendLine("</script>");
				script = sb.ToString();
			}
			StringBuilder html = new StringBuilder(System.IO.File.ReadAllText(layout));

			// todo : render body
			html.Replace("@RenderBody()", System.IO.File.ReadAllText(body));
			html.Replace("@RenderScript()", script);

			Response.ContentType = "text/html";
			Response.Write(html.ToString());
		}
	}
}
