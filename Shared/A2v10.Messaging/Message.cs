// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	internal class CommonMessage : IQueuedMessage
	{
		public Int64 Id { get; set; }

		public String Template { get; set; }
		public String Key { get; set; }
		public Int64 TargetId { get; set; }

		public String Source { get; set; }
		public Boolean Immediately { get; set; }

		public IDictionary<String, Object> Parameters { get; } = new Dictionary<String, Object>();
		public IDictionary<String, Object> Environment { get; } = new Dictionary<String, Object>();
	}
}
