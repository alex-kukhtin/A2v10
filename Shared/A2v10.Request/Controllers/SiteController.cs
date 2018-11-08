using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace A2v10.Request
{
	public class SiteController
	{
		protected readonly IApplicationHost _host;

		public SiteController()
		{
			// DI ready
			IServiceLocator locator = ServiceLocator.Current;
			_host = locator.GetService<IApplicationHost>();
		}

		public async Task Render(String pathInfo, HttpResponseBase Response)
		{
			var rm = await RequestModel.CreateFromBaseUrl(_host, false, pathInfo);
			var rw = rm.GetCurrentAction();
			var layout = _host.MakeFullPath(false, String.Empty, "layout.html");
			if (!System.IO.File.Exists(layout))
				throw new FileNotFoundException(layout);
			String body = _host.MakeFullPath(false, rw.Path, $"{rw.GetView()}.html");
			if (!System.IO.File.Exists(body))
				throw new FileNotFoundException(body);
			String script = String.Empty;
			if (!String.IsNullOrEmpty(rw.script))
			{
				String jsfile = _host.MakeFullPath(false, rw.Path, $"{rw.script}.js");
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
