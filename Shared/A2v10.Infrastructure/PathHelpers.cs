// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

namespace A2v10.Infrastructure
{
	public static class PathHelpers
	{
		public static String AddExtension(this String This, String extension)
		{
			if (String.IsNullOrEmpty(This))
				return This;
			String ext = "." + extension;
			if (This.EndsWith(ext))
				return This;
			return This + ext;
		}

		public static String RemoveHeadSlash(this String This)
		{
			if (String.IsNullOrEmpty(This))
				return This;
			if (This.StartsWith("/"))
				return This.Substring(1);
			return This;
		}

		public static String RemoveEOL(this String This)
		{
			if (String.IsNullOrEmpty(This))
				return This;
			return This.Replace("\n", "").Replace("\r", "");
		}


		public static String CombineRelative(String path1, String path2)
		{
			var dirSep = new String(Path.DirectorySeparatorChar, 1);
			var combined = Path.GetFullPath(Path.Combine(dirSep, path1, path2));
			var root = Path.GetFullPath(dirSep);
			return combined.Substring(root.Length);
		}
	}
}
