// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public class NullMessaging : IMessaging
	{
		public IQueuedMessage CreateQueuedMessage()
		{
			return null;
		}

		public Int64 QueueMessage(IQueuedMessage message)
		{
			return 0;
		}

		public Task<Int64> QueueMessageAsync(IQueuedMessage message, Boolean immediately)
		{
			return Task.FromResult(0L);
		}
	}
}
