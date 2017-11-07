// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Activities;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
    public class RemoveInbox : CodeActivity
    {
        [RequiredArgument]
        public InArgument<Int64> InboxId { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            IDbContext dbContext = ServiceLocator.Current.GetService<IDbContext>();
            Int64 id = InboxId.Get(context);
            InboxInfo ii = new InboxInfo() {
                Id = id
            };
            dbContext.Execute(String.Empty, "a2workflow.[Inbox.Remove]", ii);
        }
    }
}
