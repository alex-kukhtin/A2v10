// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Web.Hosting;
using System.Web.Mvc;
using System.Web.Mvc.Html;

using A2v10.Request;


namespace A2v10.Web.Base
{
	public static class HtmlExtensions
	{
		public static MvcHtmlString RenderVueModelScript(this HtmlHelper<ViewInfo> htmlHelper, String fileName = null)
		{
			var viewInfo = htmlHelper.ViewData.Model;
			var sb = new StringBuilder();

			if (fileName != null)
			{
				var appKey = AppConfig.AppKey();
				var appPath = AppConfig.AppPath();

				String layoutScriptPath = HostingEnvironment.MapPath($"{appPath}{appKey}/{viewInfo.Path}/{fileName}.js");

				StringBuilder scriptText = new StringBuilder(File.ReadAllText(layoutScriptPath));
				scriptText.Replace("$(PageId)", viewInfo.PageId);
				scriptText.Replace("$(DataModel)", viewInfo?.Scripts?.DataScript);
				scriptText.Replace("$(BaseUrl)", viewInfo.BaseUrl);

				sb.Append($"<script type=\"text/javascript\">{scriptText.ToString()}</script>");
			}
			else if (!String.IsNullOrEmpty(viewInfo?.Scripts?.Script))
			{
				sb.Append($"{viewInfo.Scripts.Script}");
			}
			return new MvcHtmlString(sb.ToString());
		}

		public static MvcHtmlString RenderPartialView(this HtmlHelper<ViewInfo> htmlHelper, String viewName, Object model)
		{
			var viewInfo = htmlHelper.ViewData.Model;
			var appKey = AppConfig.AppKey();
			var appPath = AppConfig.AppPath();
			String viewRelative = $"{appPath}{appKey}/{viewInfo.Path}/{viewName}.cshtml";
			String viewPath = HostingEnvironment.MapPath(viewRelative);
			if (File.Exists(viewPath))
				return htmlHelper.Partial(viewRelative, model);
			return htmlHelper.Partial(viewName, model);
		}
	}
}
