// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace BackgroundProcessor
{
	public class BackgroundLogger : ILogger
	{
		private readonly IDbContext _dbContext;

		public BackgroundLogger(IDbContext dbContext)
		{
			_dbContext = dbContext;
		}

		#region ILogger
		public void LogApi(LogEntry entry)
		{
			throw new NotImplementedException();
		}

		public void LogMessaging(LogEntry enry)
		{
			throw new NotImplementedException();
		}

		public void LogSecurity(LogEntry enry)
		{
			throw new NotImplementedException();
		}
		#endregion

		public void LogBackground(LogEntry entry)
		{
			//_dbContext.Execute(String.Empty, "a2background.WriteLog", entry);
			Console.WriteLine($"{DateTime.Now.ToString("dd.MM.yyyy HH.mm.ss")} {entry.Message}");
		}
	}
}
