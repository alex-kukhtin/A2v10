// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	[ContentProperty("Messages")]
	public class Template
	{
		Dictionary<String, IMessage> _messages;
		public Dictionary<String, IMessage> Messages
		{
			get
			{
				if (_messages == null)
					_messages = new Dictionary<String, IMessage>();
				return _messages;
			}
			set
			{
				_messages = value;
			}
		}

		public IMessage Get(String key)
		{
			if (_messages.TryGetValue(key, out IMessage message))
				return message;
			return null;
		}
	}
}
