// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using System.Dynamic;

namespace A2v10.Request.Api
{
	public class JavascriptCommandHandler : ApiCommandHandler
	{
		private readonly ApiScriptCommand _command;
		private readonly IServiceLocator _serviceLocator;
		private readonly IJavaScriptEngine _script;
		private readonly IApplicationReader _reader;

		public JavascriptCommandHandler(IServiceLocator serviceLocator, ApiScriptCommand command, Boolean wrap)
		{
			_serviceLocator = serviceLocator;
			_script = _serviceLocator.GetService<IJavaScriptEngine>();
			_reader = _serviceLocator.GetService<IApplicationHost>().ApplicationReader;
			_command = command;
			_wrap = wrap;
		}

		public override async Task<ApiResponse> ExecuteAsync(ApiRequest request)
		{
			if (String.IsNullOrEmpty(_command.Script))
				throw new RequestModelException($"'script' must be specified for script command");
			String code = await _reader.ReadTextFileAsync(_command.Path, _command.Script.AddExtension("js"));
			_script.SetCurrentDirectory(_command.Path);
			var args = new ExpandoObject();
			if (request.Body != null)
				args.Set("body", request.Body);
			if (request.Query != null)
				args.Set("query", request.Query);
			if (!String.IsNullOrEmpty(_command.Id))
				args.Set("id", _command.Id);
			var obj = _script.Execute(code, _command.Parameters, args);

			return new ApiResponse()
			{
				ContentType = MimeTypes.Application.Json,
				Body = JsonConvert.SerializeObject(Wrap(obj), JsonHelpers.CompactSerializerSettings)
			};
		}
	}
}
