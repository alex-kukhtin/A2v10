// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;

namespace A2v10.Infrastructure
{

	public enum LogSeverity
	{
		Debug = 68			/* 'D' */,
		Information = 73	/* 'I' */,
		Warning = 87		/* 'W' */,
		Error = 69			/* 'E' */,
		Fatal = 70			/* 'D' */
	};

	public class LogEntry
	{
		public LogSeverity Severity { get; }
		public String Message { get; }
		public Int64 Id { get; set; }

		public Char SeverityChar => (Char) Severity;

		public LogEntry(LogSeverity severity, String message)
		{
			if (String.IsNullOrEmpty(message))
				throw new ArgumentNullException(nameof(message));
			Severity = severity;
			Message = message;
		}
	}

	public class LogApiEntry : LogEntry
	{
		public String Host { get; set; }
		public Guid Guid { get; set; }
		public LogApiEntry(LogSeverity severity, String message, String host, Guid guid)
			: base(severity, message)
		{
			Host = host;
			Guid = guid;
		}
	}

	public interface ILogger
	{
		void LogSecurity(LogEntry enry);
		void LogMessaging(LogEntry enry);
		void LogApi(LogApiEntry entry);
		void LogBackground(LogEntry entry);
	}

	public static class LoggerExtensions
	{
		public static void LogMessaging(this ILogger logger, String message, Int64 Id = 0)
		{
			logger.LogMessaging(new LogEntry(LogSeverity.Information, message) { Id = Id });
		}

		public static void LogMessagingError(this ILogger logger, String message, Int64 Id = 0)
		{
			logger.LogMessaging(new LogEntry(LogSeverity.Error, message) { Id = Id });
		}

		public static void LogMessagingException(this ILogger logger, Exception ex, Int64 Id = 0)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			logger.LogMessaging(new LogEntry(LogSeverity.Information, ex.Message) { Id = Id });
		}

		public static void LogApi(this ILogger logger, String message, String host, Guid guid)
		{
			logger.LogApi(new LogApiEntry(LogSeverity.Information, message, host, guid));
		}

		public static void LogApiError(this ILogger logger, String message, String host, Guid guid)
		{
			logger.LogApi(new LogApiEntry(LogSeverity.Error, message, host, guid));
		}

		public static void LogBackground(this ILogger logger, String message)
		{
			logger.LogBackground(new LogEntry(LogSeverity.Information, message));
		}

		public static void LogBackgroundError(this ILogger logger, String message)
		{
			logger.LogBackground(new LogEntry(LogSeverity.Error, message));
		}
	}
}
