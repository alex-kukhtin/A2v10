// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
	public class Request : NativeActivity<RequestResult>
	{
		[RequiredArgument]
		public InArgument<Inbox> Inbox { get; set; }
		public InArgument<TrackRecord> TrackBefore { get; set; }
		public InArgument<TrackRecord> TrackAfter { get; set; }

		public InArgument<MessageInfo> SendBefore { get; set; }
		public InArgument<MessageInfo> SendAfter { get; set; }
		public InArgument<ModelStateInfo> StateBefore { get; set; }
		public InArgument<ModelStateInfo> StateAfter { get; set; }

		public OutArgument<Int64> InboxId { get; set; }

		protected override bool CanInduceIdle { get { return true; } }

		protected override void CacheMetadata(NativeActivityMetadata metadata)
		{
			base.CacheMetadata(metadata);
		}

		protected override void Execute(NativeActivityContext context)
		{
			var process = Process.GetProcessFromContext(context);
			var wfResult = context.GetExtension<WorkflowResult>();
			Inbox inbox = Inbox.Get<Inbox>(context);
			IDbContext dbContext = context.GetExtension<IDbContext>();
			inbox.Create(dbContext, process.Id);
			InboxId.Set(context, inbox.Id);
			wfResult.InboxIds.Add(inbox.Id);
			// track before
			context.DoTrack(dbContext, TrackBefore.Get<TrackRecord>(context));
			// send before
			SendMessage(SendBefore.Get<MessageInfo>(context), inbox, context);
			// state before
			context.DoModelState(dbContext, StateBefore.Get<ModelStateInfo>(context), inbox.Id);
			context.TrackRecord($"Inbox created {{Id: {inbox.Id}}}.");
			context.CreateBookmark(inbox.Bookmark, new BookmarkCallback(this.ContinueAt));
		}

		void ContinueAt(NativeActivityContext context, Bookmark bookmark, Object obj)
		{
			if (!(obj is RequestResult))
				throw new WorkflowException("Invalid ResponseType. Must be RequestResult");
			IDbContext dbContext = context.GetExtension<IDbContext>();
			Process process = Process.GetProcessFromContext(context);
			var rr = obj as RequestResult;
			Inbox inbox = Inbox.Get<Inbox>(context);
			inbox.Resumed(dbContext, rr.InboxId, rr.UserId, rr.Answer);
			context.TrackRecord($"Inbox resumed {{Id: {rr.InboxId}, UserId: {rr.UserId}) Result:'{rr.Answer}'}}");
			// track after
			context.DoTrack(dbContext, TrackAfter.Get<TrackRecord>(context), rr.UserId);
			// send after
			SendMessage(SendAfter.Get<MessageInfo>(context), inbox, context);
			// state after
			context.DoModelState(dbContext, StateAfter.Get<ModelStateInfo>(context), rr.InboxId, rr.UserId);
			this.Result.Set(context, rr);
		}

		void SendMessage(MessageInfo messageInfo, Inbox inbox, NativeActivityContext context)
		{
			if (messageInfo == null)
				return;
			var process = Process.GetProcessFromContext(context);
			IMessaging messaging = context.GetExtension<IMessaging>();
			IMessage msg = messaging.CreateMessage();

			msg.Template = messageInfo.Template;
			msg.Key = messageInfo.Key;

			msg.DataSource = process.DataSource;
			msg.Schema = process.Schema;
			msg.Model = process.ModelName;
			msg.ModelId = process.ModelId;
			msg.Source = $"Inbox:{inbox.Id}";

			msg.Params.Append(messageInfo.Params, replaceExisiting: true);
			msg.Environment.Add("InboxId", inbox.Id);
			msg.Environment.Add("ProcessId", process.Id);

			messaging.QueueMessage(msg);
			context.TrackRecord($"Message queued successfully {{Id: {msg.Id}}}");
		}
	}
}
