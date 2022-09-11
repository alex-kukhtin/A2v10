// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc.Actions;

public class AppList : IInvokeTarget
{

	private IApplicationHost _host;
	public void Inject(IApplicationHost host)
	{
		_host = host;
	}

	public async Task<Object> InvokeAsync(Int64 UserId)
	{
		var appReader = _host.ApplicationReader;
		var text = await appReader.ReadTextFileAsync("../_apps", "applist.json");
		if (text != null)
		{
			return JsonConvert.DeserializeObject(text);
		}
		return null;
	}
}
