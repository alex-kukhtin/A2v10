// Copyright © 2019-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Net;
using System.Threading.Tasks;
using A2v10.Infrastructure;

namespace A2v10.Javascript;

public class InvokeCommand
{
    private readonly IServiceLocator _locator;
    private readonly ICommandInvoker _invoker;
    public InvokeCommand(IServiceLocator locator)
    {
		_locator = locator;
        _invoker = locator.GetService<ICommandInvoker>();   
    }
    public FetchResponse Execute(String command, String baseUrl, ExpandoObject parameters)
    {
        try
        {
            var x = Task.Run(async () => await _invoker.Invoke(command, baseUrl, parameters));
            x.Wait();
            return new FetchResponse(HttpStatusCode.OK, x.Result.ContentType, x.Result.StringData, null);
        }
        catch (AggregateException ex) 
        {
            var msg = ex?.InnerException.Message ?? ex.Message;
			return new FetchResponse(HttpStatusCode.InternalServerError, MimeTypes.Text.Plain, msg, null);
		}
	}
}
