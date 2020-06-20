// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{

	public class PendingWorkflow
	{
		public Int64 ProcessId { get; set; }
		public Guid WorkflowId { get; set; }
		public Boolean AutoStart { get; set; }
	}

	public class Pending : IBackgroundProcessing
	{
		public void Start(IBackgroundTasksManager manager, TimeSpan interval, Int32 count, String parameter, Boolean batch, Int32? priority)
		{
			if (interval == TimeSpan.Zero)
				return; // interval not specified, do not run
			if (count == 0)
				return; // not specified quantity, do not run
			manager.ScheduleBackgroundTask(
				() =>
				{
					ProcessPendings(count, manager, parameter);
				},
				interval,
				DateTime.UtcNow + TimeSpan.FromSeconds(5) /* let everything start in 5 seconds */
			);
		}

		void ProcessPendings(Int32 wakeupCount, IBackgroundTasksManager manager, String parameter)
		{
			IList<PendingWorkflow> list = null;
			try
			{
				manager.Logger.LogBackground("Loading pending workflows");
				var prms = new ExpandoObject();
				prms.Set("Count", wakeupCount);
				if (parameter != null)
					prms.Set("Parameter", parameter);
				list = manager.DbContext.LoadList<PendingWorkflow>(String.Empty, "a2workflow.[Process.Pendings]", prms);
				if (list == null)
					return;
			}
			catch (Exception ex)
			{
				String msg = ex.Message;
				if (ex.InnerException != null)
					msg = ex.InnerException.Message;
				manager.Logger.LogBackgroundError(msg);
			}
			if (list.Count <= 0)
				return;

			manager.Logger.LogBackground($"{list.Count} item(s) loaded");
			try
			{
				foreach (var pw in list)
				{
					// local data needed
					var wfId = pw.WorkflowId;
					var pId = pw.ProcessId;
					var wfAuto = pw.AutoStart;

					manager.ScheduleBackgroundTask(() =>
					{
						if (wfAuto)
						{
							manager.Logger.LogBackground($"Autostarting process. ProcessId = {pId}");
							AppWorkflow.AutoStart(pId, manager.Host, manager.DbContext, manager.Messaging, manager.Logger);
						}
						else
						{
							// resume timer
							manager.Logger.LogBackground($"Resuming timer. ProcessId = {pId}");
							AppWorkflow.ResumeWorkflowTimer(manager.Host, manager.DbContext, manager.Messaging, pId);
						}
					});
				}
			}
			catch (Exception ex)
			{
				String msg = ex.Message;
				if (ex.InnerException != null)
					msg = ex.InnerException.Message;
				manager.Logger.LogBackgroundError(msg);
			}
		}
	}
}
