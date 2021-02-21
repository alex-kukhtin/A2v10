// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System.Threading.Tasks;

namespace A2v10.Request.Api
{
	public abstract class ApiCommandHandler
	{
		public abstract Task<ApiResponse> ExecuteAsync(ApiRequest request);
	}
}
