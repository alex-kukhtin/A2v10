// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Web.WebPages;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Reports.Actions;

public record StreamResult
{
	public StreamResult(Stream stream, String path = null)
	{
		Stream = stream;	
		Path = path;	
	}
	public Stream Stream { get; set; }
	public String Path { get; set; }
}

public abstract class AttachReportBase
{
	protected IApplicationHost _host;
	protected abstract String FileExtension { get; }
	protected StreamResult CreateStream(IDataModel model, String report)
	{
		String templExpr = report.TemplateExpression();
		if (templExpr != null)
		{
			var bytes = model.Eval<Byte[]>(templExpr);
			if (bytes == null)
				throw new InvalidDataException($"Expression '{report}'  is null");
			return new StreamResult(new MemoryStream(bytes));
		}
		else
		{
			String path = _host.ApplicationReader.MakeFullPath(report, String.Empty).ToLowerInvariant();
			if (!path.EndsWith(FileExtension))
				path += FileExtension;
			if (!_host.ApplicationReader.FileExists(path))
				throw new FileNotFoundException(path);
			return new StreamResult(
				_host.ApplicationReader.FileStreamFullPathRO(path),
				path);
		}
	}
}
