// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
	public class StartProcess : NativeActivity<String>
	{
		public InArgument<Boolean> WaitComplete { get; set; }
		public InArgument<String> Mark { get; set; }

		[RequiredArgument]
		public InArgument<StartProcessInfo> ProcessInfo {get;set;}
		public InArgument<TrackRecord> TrackBefore { get; set; }
		public InArgument<TrackRecord> TrackAfter { get; set; }
		public InArgument<ModelStateInfo> StateBefore { get; set; }
		public InArgument<ModelStateInfo> StateAfter { get; set; }

		protected override Boolean CanInduceIdle => true;

		protected override void CacheMetadata(NativeActivityMetadata metadata)
		{
			base.CacheMetadata(metadata);
		}

		protected override void Execute(NativeActivityContext context)
		{
			Boolean waitComplete = WaitComplete.Get<Boolean>(context);
			IDbContext dbContext = context.GetExtension<IDbContext>();
			var messaging = context.GetExtension<IMessaging>();
			IApplicationHost host = context.GetExtension<IApplicationHost>();
			context.DoTrack(dbContext, TrackBefore.Get<TrackRecord>(context));
			context.DoModelState(dbContext, StateBefore.Get<ModelStateInfo>(context));

			var pi = ProcessInfo.Get<StartProcessInfo>(context);

			String bookmark = null;
			if (waitComplete)
			{
				bookmark = Guid.NewGuid().ToString();
				var wfResult = context.GetExtension<WorkflowResult>();
				var process = Process.GetProcessFromContext(context);
				// TODO: WAIT COMPLETE FOR CHILDREN
				//Int64 pid = process.CreateChildren(dbContext, kind, docId, bookmark, Mark.Get<String>(context));
			}

			var sfi = new StartWorkflowInfo() {
				UserId = 0,
				Source = pi.Workflow,
				DataSource = pi.DataSource,
				Schema = pi.Schema,
				Model = pi.ModelName,
				ModelId = pi.ModelId,
				ActionBase = pi.ActionBase
			};

			var task = AppWorkflow.StartWorkflow(host, dbContext, messaging, sfi);
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
			context.DoModelState(dbContext, StateAfter.Get<ModelStateInfo>(context));
			context.DoTrack(dbContext, TrackAfter.Get<TrackRecord>(context));
		}
	}
}
