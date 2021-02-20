// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Request
{
	public static class MimeTypes
	{
		public static class Image
		{
			public const String Gif = "image/gif";
			public const String Tiff = "image/tiff";
			public const String Jpeg = "image/jpeg";
			public const String Png = "image/png";
		}
	}

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
