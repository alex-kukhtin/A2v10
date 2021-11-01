// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Messaging
{
	public class MessageReportParam
	{
		public String Value { get; set; }
	}

	[ContentProperty("Parameters")]
	public class MessageReportModel
	{
		public String Source { get; set; }
		public String Model { get; set; }
		public String Schema { get; set; }
		public Dictionary<String, MessageReportParam> Parameters { get; set; } = new Dictionary<String, MessageReportParam>();
	}

	[ContentProperty("Model")]
	public class MessageReport
	{
		public String Report { get; set; }
		public String Name { get; set; }
		public MessageReportModel Model { get; set; }
	}

	public class MessageReportCollection : List<MessageReport>
	{
	}

}
