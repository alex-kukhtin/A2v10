// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Globalization;
using System.IO;
using System.Threading;
using System.Web.Mvc;

using Stimulsoft.Report.Mvc;
using Stimulsoft.Report.Web;

namespace A2v10.Stimulsoft
{
	public class EmptyView : IView, IViewDataContainer
	{
		public ViewDataDictionary ViewData { get; set; }
		public void Render(ViewContext viewContext, TextWriter writer)
		{
			// do nothing
		}
	}

	public class StimulsoftViewer
	{

		private readonly String _locale;

		public StimulsoftViewer(String locale)
		{
			_locale = locale;
		}

		private String LocaleKey
		{
			get
			{
				if (String.IsNullOrEmpty(_locale))
					return Thread.CurrentThread.CurrentUICulture.TwoLetterISOLanguageName;
				return _locale.Substring(0, 2);
			}
		}

		private StiMvcViewerOptions ViewerOptions
		{
			get
			{
				String localeFile = $"~/Localization/{LocaleKey}.xml";
				return new StiMvcViewerOptions()
				{
					Theme = StiViewerTheme.Office2013LightGrayBlue,
					Localization = localeFile,
					Server = new StiMvcViewerOptions.ServerOptions()
					{
						Controller = "StiReport",
						RequestTimeout = 300,
						UseRelativeUrls = true
					},
					Actions = new StiMvcViewerOptions.ActionOptions()
					{
						GetReport = "GetReport",
						ViewerEvent = "ViewerEvent",
						PrintReport = "PrintReport",
						ExportReport = "ExportReport",
						Interaction = "Interaction",
					},
					Appearance = new StiMvcViewerOptions.AppearanceOptions()
					{
						BackgroundColor = System.Drawing.Color.FromArgb(0x00e3e3e3),
						ShowTooltips = false,
						ScrollbarsMode = true,
						FullScreenMode = true,
					},
					Toolbar = new StiMvcViewerOptions.ToolbarOptions()
					{
						MenuAnimation = false,
						ShowFullScreenButton = false,
						ShowMenuMode = StiShowMenuMode.Click,
						//FontFamily = "system-ui, 'Segoe UI', Tahoma, Verdana, sans-serif",
						//FontColor = System.Drawing.Color.FromArgb(0x00333333),
						ShowBookmarksButton = false,
						ShowParametersButton = true,
						ShowSendEmailButton = false,
					},
					Exports = new StiMvcViewerOptions.ExportOptions()
					{
						DefaultSettings = StiReportExtensions.GetExportSettings()
					}
				};
			}
		}


		public MvcHtmlString Show(Controller controller)
		{
			var view = new EmptyView();
			var vc = new ViewContext(controller.ControllerContext, view, controller.ViewData, controller.TempData, controller.Response.Output);
			var hh = new HtmlHelper(vc, view);
			var result = hh.Stimulsoft().StiMvcViewer("A2v10StiMvcViewer", ViewerOptions);
			return result;
		}
	}
}
