// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Infrastructure;

public interface IInvokeClrHandler
{
	Task InvokeAsync(ExpandoObject data);
}
