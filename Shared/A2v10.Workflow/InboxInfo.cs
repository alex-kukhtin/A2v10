// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Workflow
{
    internal class InboxInfo
    {
        public Int64 Id { get; set; }
        public String Bookmark { get; set; }
        public String Kind { get; set; }
        public String Definition { get; set; }
        public Guid WorkflowId { get; set; }

        internal static async Task<InboxInfo> Load(IDbContext dbContext, Int64 id, Int64 userId)
        {
            return await dbContext.LoadAsync<InboxInfo>(null, "a2workflow.[InboxInfo.Load]", new { Id = id, UserId = userId });
        }
    }
}
