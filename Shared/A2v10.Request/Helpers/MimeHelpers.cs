// Copyright © 2021 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Request
{
	public static class MimeHelpers
	{
		public const String CacheHeader = "max-age=2592000, private";
		public static Boolean IsImage(String contentType)
		{
			return contentType == MimeTypes.Image.Gif ||
				contentType == MimeTypes.Image.Tiff ||
				contentType == MimeTypes.Image.Jpeg ||
				contentType == MimeTypes.Image.Png;
		}
	}
}
