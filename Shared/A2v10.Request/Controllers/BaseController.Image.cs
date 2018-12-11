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
			var filePath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey ?? String.Empty, url.RemoveHeadSlash()));
			ii.Stream = File.ReadAllBytes(filePath);
			ii.Mime = MimeMapping.GetMimeMapping(filePath);
			return ii;
		}
	}
}
