// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.IO;

using A2v10.Infrastructure;

namespace A2v10.Request;

public class HtmlRenderer : IRenderer
{
	private readonly ILocalizer _localizer;
	private readonly IApplicationHost _host;
	public HtmlRenderer(ILocalizer localizer, IApplicationHost host)
	{
		_localizer = localizer;
		_host = host;
	}

	public void Render(RenderInfo info)
	{
		using (_host.Profiler.CurrentRequest.Start(ProfileAction.Render, $"render: {info.FileTitle}"))
		{
			using (var tr = new StreamReader(info.FileName))
			{
				String htmlText = tr.ReadToEnd();
				htmlText = htmlText.Replace("$(RootId)", info.RootId);
				htmlText = _localizer.Localize(null, htmlText, false);
				info.Writer.Write(htmlText);
			}
		}
	}
}
