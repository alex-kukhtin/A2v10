// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IMessaging
	{
		IQueuedMessage CreateQueuedMessage();

		Int64 QueueMessage(IQueuedMessage message);
		Task<Int64> QueueMessageAsync(IQueuedMessage message, Boolean immediately);
		Task SendMessageAsync(Int64 msgId);
	}
}
