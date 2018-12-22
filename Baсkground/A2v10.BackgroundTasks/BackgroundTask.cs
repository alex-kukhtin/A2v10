// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.BackgroundTasks
{
	public class BackgroundTask
	{
		private readonly Action _action;
		private TimeSpan _interval;

		public Action Action => _action;
		public TimeSpan Interval =>_interval;

		public BackgroundTask(Action action, TimeSpan interval)
		{
			_action = action;
			_interval = interval;
		}

		public Task CreateTask()
		{
			return new Task(_action);
		}

		public Boolean IsNextToRun { get { return _interval != TimeSpan.Zero; } }

		public DateTime GetNextTimeToRun()
		{
			if (!IsNextToRun)
				throw new InvalidOperationException("_interval");
			return DateTime.UtcNow + _interval;
		}
	}
}
