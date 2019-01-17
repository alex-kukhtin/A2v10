// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;

namespace A2v10.Workflow
{
	public class MessageInfo
	{
		public Int64 TargetId { get; set; }
		public String Template { get; set; }
		public String Key { get; set; }
		public Dictionary<String, Object> Parameters { get; set; }

		public Boolean Immediately { get; set; }

		public static Dictionary<String, Object> CreateParameters(Object prms)
		{
			return DynamicHelpers.Object2Dictionary(prms);
		}
	}
}
