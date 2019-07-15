// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Web;

using A2v10.Infrastructure;

namespace A2v10.Request
{

	public partial class BaseController
	{
		public AttachmentInfo StaticImage(String url)
		{
			var ii = new AttachmentInfo();
			String path = Host.ApplicationReader.MakeFullPath(url.RemoveHeadSlash(), String.Empty);
			if (!Host.ApplicationReader.FileExists(path))
				throw new InvalidOperationException($"File not found '{url}'");
			using (var br = new BinaryReader(Host.ApplicationReader.FileStreamFullPathRO(path)))
			{
				ii.Stream = br.ReadBytes((Int32) br.BaseStream.Length);
				ii.Mime = MimeMapping.GetMimeMapping(url);
				return ii;
			}
		}
	}
}
