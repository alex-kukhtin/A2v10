// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	internal class CommonMessage : IMessage
	{
		public Int64 Id { get; set; }

		public String Template { get; set; }
		public String Key { get; set; }
		public String DataSource { get; set; }
		public String Schema { get; set; }
		public String Model { get; set; }
		public Int64 ModelId { get; set; }
		public String Source { get; set; }

		public IDictionary<String, Object> Params { get; } = new Dictionary<String, Object>();
		public IDictionary<String, Object> Environment { get; set; } = new Dictionary<String, Object>();
		public List<IMessageAddress> To { get; } = new List<IMessageAddress>();
		public List<IMessageAddress> Bcc { get; } = new List<IMessageAddress>();
		public List<IMessageAddress> Cc { get; } = new List<IMessageAddress>();
	}
}
