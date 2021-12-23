using System;
using System.Activities;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
	public class SendMessage : NativeActivity
	{
		[RequiredArgument]
		public InArgument<MessageInfo> Message { get; set; }
		public InArgument<TrackRecord> Track { get; set; }

		protected override void Execute(NativeActivityContext context)
		{
			var process = Process.GetProcessFromContext(context);
			IDbContext dbContext = context.GetExtension<IDbContext>();
			// send
			QueueMessage(Message.Get<MessageInfo>(context), context);
			// track
			context.DoTrack(dbContext, Track.Get<TrackRecord>(context));
		}

		void QueueMessage(MessageInfo mi, NativeActivityContext context)
		{
			if (mi == null)
				return;
			var process = Process.GetProcessFromContext(context);
			IMessaging messaging = context.GetExtension<IMessaging>();

			var qm = messaging.CreateQueuedMessage();

			qm.Template = mi.Template;
			qm.Key = mi.Key;
			qm.TargetId = mi.TargetId;
			qm.Immediately = mi.Immediately;

			qm.Source = $"SendMessage";

			qm.Environment.Add("ProcessId", process.Id);
			qm.Parameters.Append(mi.Parameters, replaceExisiting: true);

			Int64 msgId = messaging.QueueMessage(qm);
			context.TrackRecord($"Message queued successfully {{Id: {msgId}}}");
		}
	}
}
