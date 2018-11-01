// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;

using A2v10.Request.Properties;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public void RenderEUSignDialog(TextWriter writer, String Id, String Base)
		{
			var euSignDialogHtml = new StringBuilder(_localizer.Localize(null, Resources.euSignDialog));
			var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
			euSignDialogHtml.Replace("$(PageGuid)", pageGuid);
			euSignDialogHtml.Replace("$(Id)", Id);
			euSignDialogHtml.Replace("$(Base)", Uri.EscapeDataString(Base));
			writer.Write(euSignDialogHtml.ToString());
		}

		public void RenderEUSignFrame(TextWriter writer, String Id, String Base)
		{
			var euSignFrameHtml = new StringBuilder(_localizer.Localize(null, Resources.euSignFrame));
			euSignFrameHtml.Replace("$(Theme)", _host.Theme);
			euSignFrameHtml.Replace("$(Build)", _host.AppBuild);
			euSignFrameHtml.Replace("$(Locale)", CurrentLang);
			var frameScript = new StringBuilder(_localizer.Localize(null, Resources.euSignFrameScript));
			frameScript.Replace("$(Id)", Id);
			frameScript.Replace("$(Base)", Uri.EscapeDataString(Base));
			euSignFrameHtml.Replace("$(FrameScript)", frameScript.ToString());
			writer.Write(euSignFrameHtml.ToString());
		}
	}
}
