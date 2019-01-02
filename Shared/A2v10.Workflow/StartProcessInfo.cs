// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Workflow
{
	public class StartProcessInfo
	{
		public String Workflow { get; set; }

		public String DataSource { get; set; }
		public String Schema { get; set; }
		public String ModelName { get; set; }
		public Int64 ModelId { get; set; }

		public String ActionBase { get; set; }
	}
}
