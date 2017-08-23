
using System;
using System.Activities;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
    public class Request : NativeActivity<RequestResult>
    {
        [RequiredArgument]
        public InArgument<Inbox> Inbox { get; set; }
        public InArgument<TrackRecord> TrackBefore { get; set; }
        public InArgument<TrackRecord> TrackAfter { get; set; }

        protected override bool CanInduceIdle { get { return true; } }

        protected override void CacheMetadata(NativeActivityMetadata metadata)
        {
            base.CacheMetadata(metadata);
            metadata.RequireExtension<IDbContext>();
        }

        protected override void Execute(NativeActivityContext context)
        {
            var dbContext = context.GetExtension<IDbContext>();
            var process = Process.GetProcessFromContext(context.DataContext);
        }

        void ContinueAt(NativeActivityContext context, Bookmark bookmark, Object obj)
        {
            if (!(obj is RequestResult))
                throw new WorkflowException("Invalid ResponseType. Must be RequestResult");
            var dbContext = context.GetExtension<IDbContext>();
            var rr = obj as RequestResult;
        }
    }
}
