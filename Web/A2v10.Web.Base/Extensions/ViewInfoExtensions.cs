// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using System.Web.Hosting;

using A2v10.Request;


namespace A2v10.Web.Base
{
	public static class ViewInfoExtensions
	{
		public static String RenderVueModelScript(this ViewInfo viewInfo, String fileName = null)
		{
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
			return sb.ToString();
		}
	}
}
