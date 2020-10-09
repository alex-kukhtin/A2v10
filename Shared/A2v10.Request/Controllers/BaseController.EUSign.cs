// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
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
			euSignFrameHtml.Replace("$(Theme)", _host.Theme?.FileName ?? String.Empty);
			euSignFrameHtml.Replace("$(Build)", _host.AppBuild);
			euSignFrameHtml.Replace("$(Locale)", CurrentLang);
			var frameScript = new StringBuilder(_localizer.Localize(null, Resources.euSignFrameScript));
			frameScript.Replace("$(Id)", Id);
			frameScript.Replace("$(Base)", Uri.EscapeDataString(Base));
			euSignFrameHtml.Replace("$(FrameScript)", frameScript.ToString());
			writer.Write(euSignFrameHtml.ToString());
		}

		public async Task RenderEUSignIFrame(TextWriter writer, String pathInfo, ExpandoObject loadPrms)
		{
			String dialogPath = pathInfo.Replace("/_iframe/", "/_dialog/");
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, dialogPath);
			rm.Phase2 = true;
			var dlg = rm.CurrentDialog;
			var euSignFrameHtml = new StringBuilder(_localizer.Localize(null, Resources.euSignFrame));
			euSignFrameHtml.Replace("$(Theme)", _host.Theme?.FileName ?? String.Empty);
			euSignFrameHtml.Replace("$(Build)", _host.AppBuild);
			euSignFrameHtml.Replace("$(Locale)", CurrentLang);

			var sb = new StringBuilder();
			using (var s = new StringWriter(sb))
			{
				await Render(dlg, s, loadPrms, secondPhase:true);
			}

			euSignFrameHtml.Replace("$(Body)", sb.ToString());
			var frameScript = new StringBuilder(_localizer.Localize(null, Resources.euSignFrameScript));
			euSignFrameHtml.Replace("$(FrameScript)", frameScript.ToString());

			writer.Write(euSignFrameHtml.ToString());
		}
	}
}
