// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Request.Api
{
	public class JavascriptCommandHandler : ApiCommandHandler
	{
		private readonly ApiClrCommand _command;
		private readonly Boolean _wrap;
		private readonly IServiceLocator _serviceLocator;

		public JavascriptCommandHandler(IServiceLocator serviceLocator, ApiClrCommand command, Boolean wrap)
		{
			_serviceLocator = serviceLocator;
			_command = command;
			_wrap = wrap;
		}

		public override Task<ApiResponse> ExecuteAsync(ApiRequest request)
		{
			//IApiClrHandler handler = Activator.CreateInstance<IApiClrHandler>(assembly, type, _serviceLocator);
			throw new NotImplementedException();
		}
	}
}
