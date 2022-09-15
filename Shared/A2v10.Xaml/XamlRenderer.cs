// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Xaml;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

public class XamlRenderer : IRenderer
{
	private readonly IProfiler _profile;
	private readonly IApplicationHost _host;

	[ThreadStatic]
	public static String RootFileName;
	[ThreadStatic]
	public static IApplicationReader ApplicationReader;

	private static Boolean _stylesLoaded = false;
	private static Styles _styles;

	public XamlRenderer(IProfiler profile, IApplicationHost host)
	{
		_profile = profile;
		_host = host;
	}

	private void SetStyles(IRootContainer root) 
	{
		if (_stylesLoaded)
		{
			if (_styles != null)
				root.SetStyles(_styles);
			return;
		}
		var stylesPath = _host.ApplicationReader.MakeFullPath(String.Empty, "styles.xaml");
		if (_host.ApplicationReader.FileExists(stylesPath))
		{
			using (var stylesStream = _host.ApplicationReader.FileStreamFullPathRO(stylesPath))
			{
				if (stylesStream != null)
				{
					if (!(XamlServices.Load(stylesStream) is Styles styles))
						throw new XamlException("Xaml. Styles is not 'Styles'");
					_styles = styles;	
					root.SetStyles(styles);
				}
			}
		}
		_stylesLoaded = true;
	}

	public void Render(RenderInfo info)
	{
		if (String.IsNullOrEmpty(info.FileName))
			throw new XamlException("No source for render");
		IProfileRequest request = _profile.CurrentRequest;
		String fileName = String.Empty;
		IXamlElement uiElem = null;
		using (request.Start(ProfileAction.Render, $"load: {info.FileTitle}"))
		{
			try
			{
				// XamlServices.Load sets IUriContext
				if (!String.IsNullOrEmpty(info.FileName))
				{
					using (var fileStream = _host.ApplicationReader.FileStreamFullPathRO(info.FileName))
					{

						RootFileName = info.FileName;
						ApplicationReader = _host.ApplicationReader;
						uiElem = XamlServices.Load(fileStream) as IXamlElement;
					}
				}
				else if (!String.IsNullOrEmpty(info.Text))
					uiElem = XamlServices.Parse(info.Text) as IXamlElement;
				else
					throw new XamlException("Xaml. There must be either a 'FileName' or a 'Text' property");
				if (uiElem == null)
					throw new XamlException("Xaml. Root is not 'UIElement'");

				if (uiElem is IRootContainer root)
					SetStyles(root);
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
