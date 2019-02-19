// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Specialized;
using System.IO;
using System.Web;

namespace A2v10.Runtime
{
	public class DesktopResponse : HttpResponseBase
	{
		public override TextWriter Output { get; set; }
		public override String ContentType { get; set; }
		public override NameValueCollection Headers => _headers;

		public BinaryWriter BinaryWriter { get; set; }

		private readonly NameValueCollection _headers = new NameValueCollection();
		public DesktopResponse(TextWriter writer)
		{
			Output = writer;
		}

		public DesktopResponse(BinaryWriter writer)
		{
			BinaryWriter = writer;
		}

		public override void BinaryWrite(Byte[] buffer)
		{
			BinaryWriter.Write(buffer);
		}
	}
}
