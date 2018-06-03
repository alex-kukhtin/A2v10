// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System;

namespace A2v10.Web.Mvc.Configuration
{
	public class WebLogger : ILogger
	{
		private readonly IDbContext _dbContext;
		private readonly IApplicationHost _host;

		public WebLogger(IApplicationHost host, IDbContext dbContext)
		{
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
			_host = host ?? throw new ArgumentNullException(nameof(host));
		}

		public void LogSecurity(LogEntry entry)
		{
			_dbContext.Execute(_host.CatalogDataSource, "a2security.WriteLog", entry);
		}

		public void LogMessaging(LogEntry entry)
		{
			_dbContext.Execute(_host.CatalogDataSource, "a2messaging.WriteLog", entry);
		}
	}
}
