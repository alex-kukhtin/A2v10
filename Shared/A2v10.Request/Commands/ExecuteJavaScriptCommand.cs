// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.


using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Request
{
	public class ExecuteJavaScriptCommand : IServerCommand
	{
		private readonly IJavaScriptEngine _engine;
		private readonly IApplicationReader _reader;

		public ExecuteJavaScriptCommand(IJavaScriptEngine engine, IApplicationReader reader)
		{
			_engine = engine;
			_reader = reader;
		}

		public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			if (String.IsNullOrEmpty(cmd.file))
				throw new RequestModelException($"'file' must be specified for command '{cmd.command}'");
			String code = await _reader.ReadTextFileAsync(cmd.Path, cmd.file.AddExtension("js"));
			if (code == null)
				throw new RequestModelException($"File not found '{cmd.file}'");
			_engine.SetCurrentDirectory(cmd.Path);
			var retval = _engine.Execute(code, dataToExec, cmd.args);
			return new ServerCommandResult() {
				Data = JsonConvert.SerializeObject(retval, JsonHelpers.StandardSerializerSettings)
			};
		}
	}
}
