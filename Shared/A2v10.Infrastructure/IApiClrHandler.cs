// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IApiRequest
	{
		ExpandoObject Body { get; }
		ExpandoObject Config { get; }
		ExpandoObject Query { get; }
		Int64 UserId { get; }
		Int32? TenantId { get; }
		String Segment { get; }
	}

	public interface IApiResponse
	{
		String ContentType { get; }
		String Body { get; }
	}

	public interface IApiClrHandler
	{
		Task<IApiResponse> HandleAsync(IApiRequest request);
	}
}
