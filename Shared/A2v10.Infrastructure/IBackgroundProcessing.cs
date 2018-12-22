// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IBackgroundProcessing
	{
		void Start(IBackgroundTasksManager manager, TimeSpan interval, Int32 count, String parameter, Boolean batch, Int32? priority);
	}
}
