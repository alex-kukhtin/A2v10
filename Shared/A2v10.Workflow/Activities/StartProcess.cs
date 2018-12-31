// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using System.Activities.Tracking;
using System.Diagnostics;
using System.Dynamic;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
	public class StartProcess : NativeActivity<String>
	{
		[RequiredArgument]
		public InArgument<Boolean> WaitComplete { get; set; }
		public InArgument<String> Mark { get; set; }

		public InArgument<TrackRecord> TrackBefore { get; set; }
		public InArgument<TrackRecord> TrackAfter { get; set; }
		public InArgument<ModelStateInfo> StateBefore { get; set; }
		public InArgument<ModelStateInfo> StateAfter { get; set; }

		protected override bool CanInduceIdle => true;

		protected override void CacheMetadata(NativeActivityMetadata metadata)
		{
			base.CacheMetadata(metadata);
		}

		protected override void Execute(NativeActivityContext context)
		{
			Boolean waitComplete = WaitComplete.Get<Boolean>(context);
			IDbContext dbContext = context.GetExtension<IDbContext>();
			IApplicationHost host = context.GetExtension<IApplicationHost>();
			DoTrack(dbContext, TrackBefore.Get<TrackRecord>(context), context);
			DoModelState(dbContext, StateBefore.Get<ModelStateInfo>(context), context);
			String bookmark = null;
			if (waitComplete)
			{
				bookmark = Guid.NewGuid().ToString();
				var wfResult = context.GetExtension<WorkflowResult>();
				var process = Process.GetProcessFromContext(context);
				//Int64 pid = process.CreateChildren(dbContext, kind, docId, bookmark, Mark.Get<String>(context));
			}

			var sfi = new StartWorkflowInfo() {
				UserId = 0,
				//DataSource, Model, ModelId, Schema, Source, 
			};

			var task = AppWorkflow.StartWorkflow(host, dbContext, sfi);
			task.Wait();
			WorkflowResult result = task.Result;

			if (waitComplete)
			{
				context.CreateBookmark(bookmark, new BookmarkCallback(this.ContinueAt));
			}
			else
			{
				Result.Set(context, String.Empty);
			}
		}

		void ContinueAt(NativeActivityContext context, Bookmark bookmark, Object obj)
		{
			String result = String.Empty;
			if (obj != null)
				result = obj.ToString();
			this.Result.Set(context, result);
			IDbContext dbContext = context.GetExtension<IDbContext>();
			DoModelState(dbContext, StateAfter.Get<ModelStateInfo>(context), context);
			DoTrack(dbContext, TrackAfter.Get<TrackRecord>(context), context);
		}

		void DoTrack(IDbContext dbContext, TrackRecord record, NativeActivityContext context)
		{
			if (record == null)
				return;
			var process = Process.GetProcessFromContext(context);
			record.ProcessId = process.Id;
			record.Update(dbContext);
			TrackRecord(context, $"TrackRecord written successfully {{Id:{record.Id}}}");
		}

		void TrackRecord(NativeActivityContext context, String msg)
		{
			var ctr = new CustomTrackingRecord(msg, TraceLevel.Info);
			context.Track(ctr);
		}

		void DoModelState(IDbContext dbContext, ModelStateInfo state, NativeActivityContext context)
		{
			if (state == null)
				return;
			var prms = new ExpandoObject();
			var process = Process.GetProcessFromContext(context);
			prms.Set("Id", process.ModelId);
			prms.Set("State", state.State);
			prms.Set("Process", process.Id);
			dbContext.LoadModel(state.DataSource, state.Procedure, prms);
		}

	}
}
