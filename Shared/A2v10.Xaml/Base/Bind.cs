// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Text.RegularExpressions;

namespace A2v10.Xaml
{
	public class Bind : BindBase, ISupportInitialize
	{

		public String Path { get; set; }
		public String Format { get; set; }
		public DataType DataType { get; set; }
		public Boolean HideZeros { get; set; }

		public Bind()
		{

		}
		public Bind(String path)
		{
			Path = path;
		}

		internal String GetPath(RenderContext context)
		{
			return context.GetNormalizedPath(Path);
		}

		// for text bindings only
		internal String GetPathFormat(RenderContext context)
		{
			if (Path == null)
				return context.GetEmptyPath(); // may be scoped
			String realPath = context.GetNormalizedPath(Path);
			if (String.IsNullOrEmpty(Format) && DataType == DataType.String)
				return realPath;
			String fmt = "null";
			String dt = "null";
			if (!String.IsNullOrEmpty(Format))
				fmt = $"'{Format.Replace("'", "\\'")}'";
			if (DataType != DataType.String)
				dt = $"'{DataType.ToString()}'";
			String opts = "null";
			if (HideZeros)
				opts = "{ hideZeros: true }";
			return $"$format({realPath}, {dt}, {context.Localize(fmt)}, {opts})";
		}


		private static Regex _selectedRegEx = new Regex(@"(\w+)\.Selected\((\w+)\)", RegexOptions.Compiled);

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
}
