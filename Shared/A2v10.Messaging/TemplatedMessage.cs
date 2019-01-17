// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System;

namespace A2v10.Messaging
{
	public class TemplatedMessage
	{
		public String Schema { get; set; }
		public String Model { get; set; }
		public String Source { get; set; }

		public void Resolve(Int64 targetId, IDbContext dbContext)
		{
			GetDataModel(targetId, dbContext);
			if (!String.IsNullOrEmpty(Model)) {
				var targetDm = dbContext.LoadModel(Source, $"[{Schema}].[{Source}.Load]", new { Id = targetId });
			}
		}

		protected IDataModel GetDataModel(Int64 targetId, IDbContext dbContext)
		{
			if (String.IsNullOrEmpty(Model))
				return null;
			return dbContext.LoadModel(Source, $"[{Schema}].[{Source}.Load]", new { Id = targetId });
		}
	}
}
