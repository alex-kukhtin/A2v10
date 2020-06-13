// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	public class MessageSendInfo : IMessageSendInfo
	{
		private List<IMessageAddress> _to = null;
		private List<IMessageAddress> _CC = null;
		private List<IMessageAddress> _Bcc = null;

		public string Subject { get; set; }
		public string Body { get; set; }

		public IEnumerable<IMessageAddress> To => _to;
		public IEnumerable<IMessageAddress> CC => _CC;

		public IEnumerable<IMessageAddress> Bcc => _Bcc;

		public void AddTo(String address, String displayName)
		{
			if (_to == null)
				_to = new List<IMessageAddress>();
			_to.Add(new MessageAddress(address, displayName));
		}

		public void AddCC(String address, String displayName)
		{
			if (_CC == null)
				_CC = new List<IMessageAddress>();
			_CC.Add(new MessageAddress(address, displayName));
		}

		public void AddBcc(String address, String displayName)
		{
			if (_Bcc == null)
				_Bcc = new List<IMessageAddress>();
			_Bcc.Add(new MessageAddress(address, displayName));
		}
	}
}
