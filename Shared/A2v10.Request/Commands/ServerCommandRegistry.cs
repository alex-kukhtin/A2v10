// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Request
{
	public static class ServerCommandRegistry
	{
		public static IServerCommand GetCommand(CommandType cmd)
		{
			var loc = ServiceLocator.Current;
			switch (cmd)
			{
				case CommandType.sql:
					return new ExecuteSqlCommand(
						loc.GetService<IDbContext>()
					);
				case CommandType.startProcess:
					return new StartProcessCommand(
						loc.GetService<IWorkflowEngine>()
					);
				case CommandType.resumeProcess:
					return new ResumeProcessCommand(
						loc.GetService<IWorkflowEngine>()
					);
				case CommandType.script:
					return new ExecuteScriptCommand(
						loc.GetService<IDbContext>(), 
						loc.GetService<IScriptProcessor>()
					);
				case CommandType.clr:
					return new ExecuteClrCommand();
				case CommandType.xml:
					return new ExecuteXmlCommand(
						loc.GetService<IApplicationHost>(), 
						loc.GetService<IDbContext>()
					);
				case CommandType.callApi:
					return new ExecuteCallApiCommand(
						loc.GetService<IApplicationHost>(), 
						loc.GetService<IDbContext>(),
						loc.GetService<IHttpService>()
					);
				case CommandType.sendMessage:
					return new ExecuteSendMessageCommand(
						loc.GetService<IApplicationHost>(), 
						loc.GetService<IMessaging>()
					);
				case CommandType.javascript:
					return new ExecuteJavaScriptCommand(
						loc.GetService<IJavaScriptEngine>(),
						loc.GetService<IApplicationHost>().ApplicationReader
					);
			}
			throw new ArgumentOutOfRangeException("Server command for '{cmd}' not found");
		}
	}
}
