// Copyright © 2022-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Reflection;
using System.Windows.Markup;
using System.Xaml;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

public class Components : MarkupExtension
{
	public String Pathes { get; set; }

	public Components()
	{

	}
	public Components(String pathes)
	{
		Pathes = pathes;
	}

	public override Object ProvideValue(IServiceProvider serviceProvider)
	{
		if (!(serviceProvider.GetService(typeof(IProvideValueTarget)) is IProvideValueTarget iTarget))
			return null;
		var targetProp = iTarget.TargetProperty as PropertyInfo;
		if (targetProp == null)
			return null;
		if (targetProp.PropertyType != typeof(ComponentDictionary))
			throw new XamlException("The 'Components' markup extension can only be used for properties that are of type 'ComponentDictionary'");

		String baseFileName = XamlRenderer.RootFileName;
		if (serviceProvider.GetService(typeof(IUriContext)) is IUriContext root && root.BaseUri != null)
			baseFileName = root.BaseUri.PathAndQuery;
		return Load(baseFileName);
	}

	Object Load(String baseFileName)
	{
		var appReader = XamlRenderer.ApplicationReader;
		String basePath = System.IO.Path.GetDirectoryName(baseFileName);
		if (appReader == null)
			throw new XamlException("Invalid ApplicationReader");

		if (String.IsNullOrEmpty(Pathes))
			return null;
		var dict = new ComponentDictionary();
		foreach (var path in Pathes.Split(','))
			dict.Append(LoadOneFile(appReader, basePath, path.Trim()));
		return dict;
	}

	ComponentDictionary LoadOneFile(IApplicationReader appReader, String basePath,  String path)
	{ 
		String trgPath = appReader.CombineRelativePath(basePath, path.RemoveHeadSlash()).ToLowerInvariant().Replace('\\','/') + ".xaml";

		if (!appReader.FileExists(trgPath))
			throw new XamlException($"File not found {path}");
		using var stream = appReader.FileStreamFullPathRO(trgPath);
		var x = XamlServices.Load(stream);
		if (x is ComponentDictionary dict)
			return dict;
		throw new XamlException("Invalid ApplicationReader");
	}
}
