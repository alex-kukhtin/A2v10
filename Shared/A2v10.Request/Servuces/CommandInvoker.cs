// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Request;

public class CommandInvoker : ICommandInvoker
{
	private readonly IServiceLocator _locator;
	public CommandInvoker(IServiceLocator locator)
	{
		_locator = locator;
	}
	public async Task<HttpInvokeResult> Invoke(String command, String baseUrl, ExpandoObject parameters)
	{
		var host = _locator.GetService<IApplicationHost>();

		var id = parameters.Get<String>("Id");

		var sourceUrl = $"/_page/{baseUrl.RemoveHeadSlash()}/{command}/{id}";

		var dataToExec = parameters.Clone();
		var rm = await RequestModel.CreateFromBaseUrl(host, sourceUrl);
		var cmd = rm.GetCommand(command);
		dataToExec.Append(cmd.parameters, replace: true);
		var result = await cmd.ExecuteCommand(_locator, dataToExec);
		return new HttpInvokeResult()
		{
			ContentType = result.ContentType,
			StringData  = result.Data
		};
	}
}
