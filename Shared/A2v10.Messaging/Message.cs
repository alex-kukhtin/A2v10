// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using A2v10.Data.Interfaces;
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

		public static CommonMessage FromDataModel(IDataModel dm)
		{
			var msg = new CommonMessage();
			var srcMsg = dm.Root.Get<ExpandoObject>("Message");
			msg.Id = srcMsg.Get<Int64>("Id");
			msg.Template = srcMsg.Get<String>("Template");
			msg.Key = srcMsg.Get<String>("Key");
			return msg;
		}
	}
}
