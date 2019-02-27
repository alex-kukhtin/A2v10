// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;
using System.Xaml;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class XamlRenderer : IRenderer
	{
		private readonly IProfiler _profile;
		private readonly IApplicationHost _host;

		[ThreadStatic]
		public static String RootFileName;
		[ThreadStatic]
		public static IApplicationReader ApplicationReader;

		public XamlRenderer(IProfiler profile, IApplicationHost host)
		{
			_profile = profile;
			_host = host;
		}

		public void Render(RenderInfo info)
		{
			if (String.IsNullOrEmpty(info.FileName))
				throw new XamlException("No source for render");
			IProfileRequest request = _profile.CurrentRequest;
			String fileName = String.Empty;
			UIElementBase uiElem = null;
			using (request.Start(ProfileAction.Render, $"load: {info.FileTitle}"))
			{
				try
				{
					// XamlServices.Load sets IUriContext
					if (!String.IsNullOrEmpty(info.FileName))
					{
						using (var fileStream = _host.ApplicationReader.FileStreamFullPath(info.FileName))
						{

							RootFileName = info.FileName;
							ApplicationReader = _host.ApplicationReader;
							uiElem = XamlServices.Load(fileStream) as UIElementBase;
						}
					}
					else if (!String.IsNullOrEmpty(info.Text))
						uiElem = XamlServices.Parse(info.Text) as UIElementBase;
					else
						throw new XamlException("Xaml. There must be either a 'FileName' or a 'Text' property");
					if (uiElem == null)
						throw new XamlException("Xaml. Root is not 'UIElement'");

					using (var stylesStream = _host.ApplicationReader.FileStream(String.Empty, "styles.xaml"))
					{
						if (stylesStream != null)
						{
							if (!(XamlServices.Load(stylesStream) is Styles styles))
								throw new XamlException("Xaml. Styles is not 'Styles'");
							if (uiElem is RootContainer root)
							{
								root.Styles = styles;
								root?.OnSetStyles();
							}
						}
					}
				}
				finally
				{
					RootFileName = null;
					ApplicationReader = null;
				}
			}

			using (request.Start(ProfileAction.Render, $"render: {info.FileTitle}"))
			{
				RenderContext ctx = new RenderContext(uiElem, info)
				{
					RootId = info.RootId,
					Path = info.Path
				};

				if (info.SecondPhase)
				{
					if (!(uiElem is ISupportTwoPhaseRendering twoPhaseRender))
						throw new XamlException("The two-phase rendering is not available");
					twoPhaseRender.RenderSecondPhase(ctx);
				}
				else
				{
					uiElem.RenderElement(ctx);
				}

				Grid.ClearAttached();
				Splitter.ClearAttached();
				FullHeightPanel.ClearAttached();
				Toolbar.ClearAttached();
			}

			if (uiElem is IDisposable disp)
			{
				disp.Dispose();
			}
		}
	}
}
