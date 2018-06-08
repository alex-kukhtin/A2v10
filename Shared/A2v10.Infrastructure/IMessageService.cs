// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IMessageService
	{
		void Send(String to, String subject, String body);
	}
}
