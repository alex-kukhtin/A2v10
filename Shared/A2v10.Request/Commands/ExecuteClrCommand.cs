// Copyright © 2019-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;
using System.Xml;

using Newtonsoft.Json;

using A2v10.Interop;
using A2v10.Infrastructure;

namespace A2v10.Request;

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
		if (result is XmlDocument xmlDoc)
		{
			return new ServerCommandResult(xmlDoc.OuterXml)
			{
				ContentType = MimeTypes.Text.Xml,
			};
		}
		return new ServerCommandResult(JsonConvert.SerializeObject(result, JsonHelpers.StandardSerializerSettings));
	}
}
