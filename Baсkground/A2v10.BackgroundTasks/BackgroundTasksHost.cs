// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.BackgroundTasks
{
	public class BackgroundTasksHost
	{
		readonly Object _lock = new Object();
		Boolean _stopProgress = false;

		public BackgroundTasksHost()
		{
		}

		public void Stop(Boolean immediate)
		{
			lock (_lock)
			{
				_stopProgress = true;
			}
		}

		public void ExecuteTask(Task task, TimeSpan? timeOut = null)
		{
			if (task == null)
				new ArgumentNullException("task");

			lock (_lock)
			{

				if (_stopProgress)
					return;
				if (task.Status == TaskStatus.Created)
					task.Start();
				if (timeOut.HasValue)
					task.Wait(timeOut.Value);
				else
					task.Wait();
			}
		}
	}
}
