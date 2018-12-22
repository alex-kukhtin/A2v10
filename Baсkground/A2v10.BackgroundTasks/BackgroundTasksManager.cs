// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.BackgroundTasks
{

	public struct TaskItem
	{
		public DateTime TimeToRun;
		public BackgroundTask Task;
	};

	public class BackgroundTasksManager : IBackgroundTasksManager
	{
		private readonly IDbContext _dbContext;
		private readonly ILogger _logger;

		private readonly Timer _timer;
		private readonly TimeSpan _timerTick = TimeSpan.FromMilliseconds(100);
		private readonly BackgroundTasksHost _host;

		private readonly Action<Exception> _failHandler = null;

		public Boolean RestartOnFailure { get; set; }

		public BackgroundTasksManager(IDbContext dbContext, ILogger logger)
		{
			_dbContext = dbContext;
			_logger = logger;
			_timer = new Timer(OnTimerElapsed);
			_host = new BackgroundTasksHost();
			RestartOnFailure = true;
		}

		public void Stop()
		{
			if (_disposed)
				return;
			StopTimer();
			_logger.LogBackground("Task manager stopped");
		}

		#region IBackgroundTasksManager

		public IDbContext DbContext => _dbContext;
		public ILogger Logger => _logger;

		readonly Object _lockTasks = new Object();
		List<TaskItem> _tasksToExecute = new List<TaskItem>();
		Boolean _disposed = false;

		public void Dispose()
		{
			if (_disposed)
				return;
			Stop();
			_disposed = true;
			_timer.Dispose();
		}

		public void ScheduleBackgroundTask(Action action)
		{
			ScheduleBackgroundTask(action, TimeSpan.Zero, DateTime.UtcNow);
		}

		void ScheduleBackgroundTask(BackgroundTask bt)
		{
			if (bt.IsNextToRun)
				ScheduleBackgroundTask(bt.Action, bt.Interval, bt.GetNextTimeToRun());
		}

		public void ScheduleBackgroundTask(Action action, TimeSpan interval, DateTime timeToRun)
		{
			// just write it to the list for execution
			var bt = new BackgroundTask(action, interval);
			lock (_lockTasks)
			{
				_tasksToExecute.Add(new TaskItem() { TimeToRun = timeToRun, Task = bt });
			}
			// restart timer
			StartTimer();
		}

		public void Start()
		{
			StartTimer();
			_logger.LogBackground("Task manager started");
		}

		public void StartTasksFromConfig()
		{
			try
			{
				if (!(ConfigurationManager.GetSection("backgroundTasks") is BackgroundTasksSection section))
					throw new ConfigurationErrorsException("Section 'backgroundTasks' not found in 'config' file");
				foreach (var t in section.tasks)
				{
					var tsk = t as BackgroundTaskElement;
					if (t == null)
						continue;
					var typeT = tsk.type.Split(',');
					var inst = System.Activator.CreateInstance(typeT[1].Trim(), typeT[0].Trim());
					var taskinst = inst.Unwrap() as IBackgroundProcessing;
					taskinst.Start(this, tsk.interval, tsk.count, tsk.parameter, tsk.batch, tsk.priority);
					_logger.LogBackground($"Task '{tsk.name}' started. {typeT[0]}");
					_logger.LogBackground($"\t{{interval: {tsk.interval}, count: {tsk.count}, parameter: {tsk.parameter},\n\tbatch: {tsk.batch}, priority: {tsk.priority}}}");
				}
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				_logger.LogBackgroundError(ex.Message);
			}
		}
		#endregion

		void StartTimer()
		{
			TimeSpan dueTime = _timerTick;
			_timer.Change(dueTime, TimeSpan.FromMilliseconds(Timeout.Infinite));
		}

		void StopTimer()
		{
			_timer.Change(Timeout.Infinite, Timeout.Infinite);
		}

		public void Next(TimeSpan dueTime)
		{
			_timer.Change(dueTime, TimeSpan.FromMilliseconds(Timeout.Infinite));
		}

		void OnTimerElapsed(Object sender)
		{
			try
			{
				StopTimer();
				ExecuteNextTask();
				Next(GetNextRunInterval()); // Start up again.
			}
			catch (Exception e)
			{
				OnException(e);

				if (RestartOnFailure)
					Next(GetNextRunInterval()); // start up again.
			}
		}

		void OnException(Exception ex)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			_logger.LogBackgroundError(ex.Message);
			var failAction = _failHandler;
			failAction?.Invoke(ex);
		}

		TimeSpan GetNextRunInterval()
		{
			lock (_lockTasks)
			{
				if (_tasksToExecute.Count == 0)
					return TimeSpan.FromDays(1); // try again tomorrow
				var ti = _tasksToExecute.OrderBy(x => x.TimeToRun).First();
				var now = DateTime.UtcNow;
				if (now > ti.TimeToRun)
					return _timerTick;
				return ti.TimeToRun - now;
			}
		}

		void ExecuteNextTask()
		{
			BackgroundTask bt = null;
			lock (_lockTasks)
			{
				if (_tasksToExecute.Count == 0)
					return;
				var ti = _tasksToExecute.OrderBy(x => x.TimeToRun).First();
				if (ti.TimeToRun >= DateTime.UtcNow)
					return;
				bt = ti.Task;
				_tasksToExecute.Remove(ti);
			}
			if (bt != null)
				_host.ExecuteTask(bt.CreateTask());
			// schedule next run
			ScheduleBackgroundTask(bt);
		}
	}
}
