// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Messaging
{
	[ContentProperty("Messages")]
	public class Template
	{
		Dictionary<String, TemplatedMessage> _messages;
		public Dictionary<String, TemplatedMessage> Messages
		{
			get
			{
				if (_messages == null)
					_messages = new Dictionary<String, TemplatedMessage>();
				return _messages;
			}
			set
			{
				_messages = value;
			}
		}

		public TemplatedMessage Get(String key)
		{
			if (_messages.TryGetValue(key, out TemplatedMessage message))
				return message;
			return null;
		}
	}
}
