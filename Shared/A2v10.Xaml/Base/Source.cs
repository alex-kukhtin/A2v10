// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Reflection;
using System.Windows.Markup;
using System.Xaml;

namespace A2v10.Xaml
{
	public class Source : MarkupExtension
	{
		public String Path { get; set; }
		public String Context { get; set; }

		public Source()
		{

		}
		public Source(String path)
		{
			Path = path;
		}

		public override Object ProvideValue(IServiceProvider serviceProvider)
		{
			try
			{
				if (!(serviceProvider.GetService(typeof(IProvideValueTarget)) is IProvideValueTarget iTarget))
					return null;
				var targetProp = iTarget.TargetProperty as PropertyInfo;
				if (targetProp == null)
					return null;
				if (targetProp.PropertyType != typeof(Object) && targetProp.PropertyType != typeof(UIElement))
				{
					throw new XamlException("The 'Source' markup extension can only be used for properties that are of type 'System.Object' or 'A2v10.Xaml.UIElement'");
				}

				var root = serviceProvider.GetService(typeof(IUriContext)) as IUriContext;
				String baseFileName = XamlRenderer.RootFileName;
				if (root != null && root.BaseUri != null)
					baseFileName = root.BaseUri.PathAndQuery;
				return Load(baseFileName);
			}
			catch (Exception ex)
			{
				return new Span() { CssClass = "xaml-exception", Content = ex.Message };
			}
		}

		Object Load(String baseFileName)
		{
			var appReader = XamlRenderer.ApplicationReader;

			String basePath = System.IO.Path.GetDirectoryName(baseFileName);
			String targetDir = appReader.CombineRelativePath(basePath, Path).ToLowerInvariant().Replace('\\','/');

			String ext = System.IO.Path.GetExtension(targetDir);


			if (appReader == null)
				throw new XamlException("Invalid ApplicationReader");
			if (ext == ".js" || ext == ".html")
			{
				if (appReader.FileExists(targetDir))
					return appReader.FileReadAllText(targetDir);
				else
					throw new XamlException($"File not found {Path}");
			}
			else
			{
				String trgPath = System.IO.Path.ChangeExtension(targetDir, "xaml");
				if (appReader.FileExists(trgPath))
				{
					try
					{
						RenderContext.SetPartialContext(Context);
						using (var stream = appReader.FileStreamFullPath(trgPath)) { 
							return XamlServices.Load(stream);
						}
					}
					finally
					{
						RenderContext.SetPartialContext(null);
					}
				}
				else
					throw new XamlException($"File not found {Path}");
			}
		}
	}
}
