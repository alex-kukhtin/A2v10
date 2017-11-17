// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

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
                return null;
            String realPath = context.GetNormalizedPath(Path);
            if (String.IsNullOrEmpty(Format) && DataType == DataType.String)
                return realPath;
            String fmt = "null";
            String dt = "null";
            if (!String.IsNullOrEmpty(Format))
                fmt = $"'{Format.Replace("'", "\\'")}'";
            if (DataType != DataType.String)
                dt = $"'{DataType.ToString()}'";
            return $"$format({realPath}, {dt}, {fmt})";
        }

        public void BeginInit()
        {
        }

        private static Regex _selectedRegEx = new Regex(@"(\w+)\.Selected\((\w+)\)", RegexOptions.Compiled);

        public void EndInit()
        {
            if (Path == null)
                return;
            var match = _selectedRegEx.Match(Path);
            if (match.Groups.Count == 3)
                Path = $"{match.Groups[1].Value}.Selected('{match.Groups[2].Value}')";
        }
    }
}
