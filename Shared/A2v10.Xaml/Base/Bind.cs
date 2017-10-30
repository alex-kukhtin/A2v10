// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	public class Bind : BindBase
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
	}
}
