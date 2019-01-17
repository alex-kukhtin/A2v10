// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	[ContentProperty("Body")]
	public class EmailMessage : TemplatedMessage
	{
		public String Subject { get; set; }
		public String Body { get; set; }
		public String BodyTemplate { get; set; }
		public String IsBodyHtml { get; set; }

		public MessageAddress From { get; set; }
		public MessageAddressCollection To { get; set; } = new MessageAddressCollection();
		public MessageAddressCollection Bcc { get; set; } = new MessageAddressCollection();
	}
}
