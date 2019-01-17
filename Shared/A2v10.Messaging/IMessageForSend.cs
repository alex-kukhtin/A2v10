// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	public interface IMessageForSend
	{
		Task SendAsync(IMessageService emailService);
	}
}
