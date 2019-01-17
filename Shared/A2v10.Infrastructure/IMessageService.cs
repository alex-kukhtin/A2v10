// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IMessageService
	{
		Task SendAsync(String to, String subject, String body);
	}
}
