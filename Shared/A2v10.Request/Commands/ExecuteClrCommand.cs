// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using A2v10.Interop;

namespace A2v10.Request
{
	public class ExecuteClrCommand : IServerCommand
	{
		public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			if (String.IsNullOrEmpty(cmd.clrType))
				throw new RequestModelException($"clrType must be specified for command '{cmd.command}'");
			var invoker = new ClrInvoker();
			Object result;
			if (cmd.async)
				result = await invoker.InvokeAsync(cmd.clrType, dataToExec);
			else
				result = invoker.Invoke(cmd.clrType, dataToExec);
			return new ServerCommandResult(JsonConvert.SerializeObject(result, JsonHelpers.StandardSerializerSettings));
		}
	}
}
