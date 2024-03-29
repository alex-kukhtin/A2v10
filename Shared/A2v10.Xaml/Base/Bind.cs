﻿// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Text;
using System.Text.RegularExpressions;
using System.Linq;

using A2v10.Infrastructure;

namespace A2v10.Xaml;

//[DefaultProperty("Path")]
public class Bind : BindBase, ISupportInitialize
{
	public String Path { get; set; }
	public String Format { get; set; }
	public DataType DataType { get; set; }
	public Boolean HideZeros { get; set; }
	public String Mask { get; set; }
	public Boolean NegativeRed { get; set; }
	public FilterCollection Filters { get; set; }

	private Boolean _wrapped;

	public Bind()
	{

	}
	public Bind(String path)
	{
		Path = path;
	}

	public String GetPath(RenderContext context)
	{
		return context.GetNormalizedPath(Path);
	}

	public String GetTypedPath(RenderContext context, TypeCheckerTypeCode typeCode)
	{
		return context.GetTypedNormalizedPath(Path, typeCode);
	}

	public void SetWrapped()
	{
		_wrapped = true;
	}


	// for text bindings only
	public String GetPathFormat(RenderContext context)
	{
		if (Path == null)
			return context.GetEmptyPath(); // may be scoped
		String realPath = context.GetNormalizedPath(Path, _wrapped);
		var maskBind = GetBinding(nameof(Mask));
		var formatBind = GetBinding(nameof(Format));
		if (String.IsNullOrEmpty(Format) && 
			DataType == DataType.String && 
			String.IsNullOrEmpty(Mask) && 
			maskBind == null && 
			formatBind == null &&
			!HideZeros)
			return realPath;
		var opts = new StringBuilder("{");
		if (DataType != DataType.String)
			opts.Append($"dataType: '{DataType}',");

		if (formatBind != null)
			opts.Append($"format: {formatBind.GetPathFormat(context)},");
		else if (!String.IsNullOrEmpty(Format))
			opts.Append($"format: '{context.Localize(Format.Replace("'", "\\'"))}',");

		if (maskBind != null)
			opts.Append($"mask: {maskBind.GetPathFormat(context)},");
		else if (!String.IsNullOrEmpty(Mask))
			opts.Append($"mask: '{context.Localize(Mask.Replace("'", "\\'"))}',");

		if (HideZeros)
			opts.Append("hideZeros: true,");
		opts.RemoveTailComma();
		opts.Append("}");
		return $"$format({realPath}, {opts})";
	}


	public Boolean HasFilters => Filters != null && Filters.Count > 0;

	public String FiltersJS()
	{
		if (!HasFilters)
			return String.Empty;
		var fStrings = Filters.Select(x => $"'{x.ToString().ToLowerInvariant()}'");
		return $"[{String.Join(",", fStrings)}]";
	}

	private static readonly Regex _selectedRegEx = new(@"([\w\.]+)\.Selected\((\w+)\)", RegexOptions.Compiled);

	#region ISupportInitialize
	public void BeginInit()
	{
	}

	public void EndInit()
	{
		if (Path == null)
			return;
		var match = _selectedRegEx.Match(Path);
		if (match.Groups.Count == 3)
			Path = $"{match.Groups[1].Value}.Selected('{match.Groups[2].Value}')";
	}
	#endregion
}
