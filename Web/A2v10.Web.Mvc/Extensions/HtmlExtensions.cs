// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Web.Hosting;
using System.Web.Mvc;

using A2v10.Request;

namespace A2v10.Web.Mvc
{
	public static class HtmlExtensions
	{
		public static MvcHtmlString RenderVueModelScript(this HtmlHelper<ViewInfo> htmlHelper)
		{
			var viewInfo = htmlHelper.ViewData.Model;
			var sb = new StringBuilder();
			if (!String.IsNullOrEmpty(viewInfo?.Script))
				sb.Append($"<script type=\"text/javascript\">{viewInfo.Script}</script>");

			String layoutScriptPath = HostingEnvironment.MapPath("~/App_apps/VueSite/_layout.js");
			StringBuilder scriptText = new StringBuilder(File.ReadAllText(layoutScriptPath));
			scriptText.Replace("$(PageId)", viewInfo.PageId);
			sb.Append($"<script type=\"text/javascript\">{scriptText}</script>");

			return new MvcHtmlString(sb.ToString());
		}
	}
}
