// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using System.Activities.Tracking;
using System.Diagnostics;
using System.Dynamic;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
	public static class ActivityExtensions
	{
		public static void DoModelState(this NativeActivityContext context, IDbContext dbContext, ModelStateInfo state, Int64? inboxId = null, Int64? userId = null)
		{
			if (state == null)
				return;
			var prms = new ExpandoObject();
			var process = Process.GetProcessFromContext(context);
			prms.Set("Id", process.ModelId);
			prms.Set("State", state.State);
			prms.Set("Process", process.Id);
			if (inboxId != null)
				prms.Set("Inbox", inboxId.Value);
			if (userId != null)
				prms.Set("UserId", userId.Value);
			dbContext.LoadModel(state.DataSource, state.Procedure, prms);
		}

		public static void DoTrack(this NativeActivityContext context, IDbContext dbContext, TrackRecord record)
		{
			if (record == null)
				return;
			var process = Process.GetProcessFromContext(context);
			record.ProcessId = process.Id;
			record.Update(dbContext);
			context.TrackRecord($"TrackRecord written successfully {{Id:{record.Id}}}");
		}

		public static void TrackRecord(this NativeActivityContext context, String msg)
		{
			var ctr = new CustomTrackingRecord(msg, TraceLevel.Info);
			context.Track(ctr);
		}

	}
}
