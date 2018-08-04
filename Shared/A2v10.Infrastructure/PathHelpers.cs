// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

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

	}
}
