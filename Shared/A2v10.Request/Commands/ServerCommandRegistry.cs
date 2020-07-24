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
			switch (cmd)
			{
				case CommandType.sql:
					return new ExecuteSqlCommand(ServiceLocator.Current.GetService<IDbContext>());
				case CommandType.startProcess:
					return new StartProcessCommand(ServiceLocator.Current.GetService<IWorkflowEngine>());
				case CommandType.resumeProcess:
					return new ResumeProcessCommand(ServiceLocator.Current.GetService<IWorkflowEngine>());
				case CommandType.script:
					return new ExecuteScriptCommand(ServiceLocator.Current.GetService<IDbContext>(), ServiceLocator.Current.GetService<IScriptProcessor>());
				case CommandType.clr:
					return new ExecuteClrCommand();
				case CommandType.xml:
					return new ExecuteXmlCommand(ServiceLocator.Current.GetService<IApplicationHost>(), ServiceLocator.Current.GetService<IDbContext>());
				case CommandType.callApi:
					return new ExecuteCallApiCommand(ServiceLocator.Current.GetService<IApplicationHost>(), ServiceLocator.Current.GetService<IDbContext>());
				case CommandType.sendMessage:
					return new ExecuteSendMessageCommand(ServiceLocator.Current.GetService<IApplicationHost>(), ServiceLocator.Current.GetService<IMessaging>());
			}
			throw new ArgumentOutOfRangeException("Server command for '{cmd}' not found");
		}
	}
}
