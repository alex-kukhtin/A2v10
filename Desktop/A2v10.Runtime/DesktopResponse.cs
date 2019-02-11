// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Web;

namespace A2v10.Runtime
{
	public class DesktopResponse : HttpResponseBase
	{
		public override TextWriter Output { get; set; }
		public override String ContentType { get; set; }
		public BinaryWriter BinaryWriter { get; set; }

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
