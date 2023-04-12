// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Reflection;
using System.Dynamic;

using Quartz;

using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Quartz;

public class InvokeClrData
{
	public String clrType { get; set; }
	public ExpandoObject data { get; set; }
}

internal class InvokeClrHandler : IJobHandler
{
	private readonly CommandJobData _job;
	private readonly IServiceProvider _serviceProvider;
	internal InvokeClrHandler(CommandJobData job, IServiceProvider sp)
	{
		_job = job;
		_serviceProvider = sp;
	}
	public Task ProcessAsync(IJobExecutionContext context)
	{
		var clrData = _job.GetObject<InvokeClrData>();
		var (assembly, type) = ClrHelpers.ParseClrType(clrData.clrType);
		var ass = Assembly.Load(assembly) ?? 
			throw new InvalidOperationException("Assembly not found");
		var handlerType = ass.GetType(type);
		var ctor = handlerType.GetConstructor(new Type[] { typeof(IServiceProvider) } )
			?? throw new InvalidOperationException("Constructor not found");
		var handler = ctor.Invoke(new Object[] { _serviceProvider })
				?? throw new InvalidOperationException("Invalid ctor");
		if (handler is not IInvokeClrHandler invokeClrHandler)
			throw new InvalidOperationException("Invalid Handler");
		return invokeClrHandler.InvokeAsync(clrData.data);
	}
}
