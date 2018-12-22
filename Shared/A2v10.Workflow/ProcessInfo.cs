// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;

namespace A2v10.Workflow
{
	public class ProcessInfo
	{
		public Int64 Id { get; set; }
		public String Kind { get; set; }
		public String Definition { get; set; }
		public Guid WorkflowId { get; set; }

		internal static ProcessInfo Load(IDbContext dbContext, Int64 id, Int64 userId)
		{
			return dbContext.Load<ProcessInfo>(null, "a2workflow.[ProcessInfo.Load]", new { Id = id, UserId = userId });
		}
	}
}
