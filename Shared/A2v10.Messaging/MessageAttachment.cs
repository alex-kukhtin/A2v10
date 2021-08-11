// Copyright © 2021 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;

namespace A2v10.Messaging
{
	public class MessageAttachment : IMessageAttachment
	{
		public String Name { get; set; }
		public String Mime { get; set; }
		public String Data { get; set; }

		public Stream Stream { get; set; }
	}

	public class MessageAttachmentCollection : List<MessageAttachment>
	{

	}

}
