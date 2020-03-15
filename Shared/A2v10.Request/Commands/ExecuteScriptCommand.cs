// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace A2v10.Request
{
	public class ExecuteScriptCommand : IServerCommand
	{

		private readonly IDbContext _dbContext;
		private readonly IScriptProcessor _scriptProcessor;

		public ExecuteScriptCommand(IDbContext dbContext, IScriptProcessor scriptProcessor)
		{
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
			_scriptProcessor = scriptProcessor ?? throw new ArgumentNullException(nameof(scriptProcessor));
		}

		public Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			// SYNC!
			if (String.IsNullOrEmpty(cmd.template))
				throw new RequestModelException($"template must be specified for command '{cmd.command}'");
			IDataModel dataModel = null;
			if (!String.IsNullOrEmpty(cmd.CurrentModel))
				dataModel = _dbContext.LoadModel(cmd.CurrentSource, cmd.LoadProcedure, dataToExec, cmd.commandTimeout);
			var ssi = new ServerScriptInfo
			{
				DataModel = dataModel,
				Path = cmd.Path,
				Template = cmd.template,
				Parameter = cmd.commandProp
			};
			var resultJson = _scriptProcessor.RunScript(ssi, "invoke");
			var result = JsonConvert.DeserializeObject<ExpandoObject>(resultJson?.ToString(), new ExpandoObjectConverter());
			var status = result.Get<String>("status");
			switch (status)
			{
				case "save":
					{
						var dataToSave = result.Get<ExpandoObject>("data");
						var savedDm = _dbContext.SaveModel(cmd.CurrentSource, cmd.UpdateProcedure, dataToSave, dataToExec);
						return Task.FromResult(new ServerCommandResult("{}"));
					}
				case "error":
					throw new RequestModelException(result.Get<String>("message"));
			}
			return Task.FromResult(new ServerCommandResult());
		}
	}
}
