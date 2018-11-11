// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using System;

namespace A2v10.Workflow
{
	public class TrackRecord
	{
		public Int64 Id { get; set; }
		public String Message { get; set; }

		public Int64 ProcessId { get; set; }
		public Int64 UserId { get; set; }

		internal void Update(IDbContext dbContext)
		{
			dbContext.Execute(String.Empty, "a2workflow.[Process.AddToTrack]", this);
		}
	}
}
