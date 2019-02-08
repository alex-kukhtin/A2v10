// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System.IO;
using System.Web;

namespace A2v10.Runtime
{
	public class DesktopResponse : HttpResponseBase
	{
		public override TextWriter Output { get; set; }

		public DesktopResponse(TextWriter writer)
		{
			Output = writer;
		}
	}
}
