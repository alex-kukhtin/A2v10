// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Request.Api
{
	public abstract class ApiCommandHandler
	{
		protected Boolean _wrap { get; set; }
		public abstract Task<ApiResponse> ExecuteAsync(ApiRequest request);

		protected Object Wrap(Object data)
		{
			if (!_wrap)
				return data;
			var m = new ExpandoObject();
			m.Set("success", true);
			m.Set("data", data);
			return m;
		}
	}
}
