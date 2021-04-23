// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
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

		public static class Application
		{
			public const String Json = "application/json";
			public const String FormData = "multipart/form-data";
		}
	}
}
