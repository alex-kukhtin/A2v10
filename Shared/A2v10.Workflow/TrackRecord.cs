// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Workflow
{
    public class TrackRecord
    {
        internal Int64 Id { get; private set; }
        public DateTime EventTime { get; private set; } = DateTime.Now;
        public String Message { get; set; }

        internal Int64 ProcessId { get; set; }
        internal Int64 UserId { get; set; }

        internal void Update(IDbContext dbContext)
        {
            dbContext.Execute(String.Empty, "a2workflow.[AddToTrack]", this);
        }
    }
}
