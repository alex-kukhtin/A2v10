// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Messaging
{
	[Serializable]
	public class MessagingException : Exception
	{
		public MessagingException(String msg)
			: base(msg)
		{
		}
	}
}
