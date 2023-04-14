// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Infrastructure;

public interface IInvokeContext
{
	String DataSource { get; }
}
public interface IInvokeClrHandler
{
	Task InvokeAsync(IInvokeContext context, ExpandoObject data);
}
