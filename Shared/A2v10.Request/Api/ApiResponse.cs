// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;

namespace A2v10.Request.Api
{
	public class ApiResponse : IApiResponse
	{
		public String ContentType { get; set; }
		public String Body { get; set; }
	}
}
