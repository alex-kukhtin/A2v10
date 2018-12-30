// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using System.Activities.Tracking;
using System.Diagnostics;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
	public class StartProcess : NativeActivity<String>
	{
		InArgument<Boolean> _wc = new InArgument<Boolean>(false);
		[RequiredArgument]
		public InArgument<Boolean> WaitComplete { get { return _wc; } set { _wc = value; } }
		public InArgument<TrackRecord> TrackBefore { get; set; }
		public InArgument<TrackRecord> TrackAfter { get; set; }

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
			// track before
			DoTrack(dbContext, TrackBefore.Get<TrackRecord>(context), context);
			String bookmark = null;
			if (waitComplete)
				bookmark = Guid.NewGuid().ToString();
			var sfi = new StartWorkflowInfo() {
			};
			WorkflowResult result = AppWorkflow.StartWorkflow(host, dbContext, sfi).Result;
			if (waitComplete) {
				
				//result.ProcessId
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
	}
}
