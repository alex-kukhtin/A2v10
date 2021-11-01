// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Messaging
{
	public class MessageAttachment
	{
		public String Name { get; set; }
		public String Mime { get; set; }
		public String Data { get; set; }
	}

	public class MessageAttachmentCollection : List<MessageAttachment>
	{

	}

}
