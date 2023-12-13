// Copyright © 2019-2023 Oleksandr  Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;
using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Request;

public class StartProcessCommand : IServerCommand
{
	readonly IWorkflowEngine _workflowEngine;
	public StartProcessCommand(IWorkflowEngine engine)
	{
		_workflowEngine = engine ?? throw new ArgumentNullException($"Service 'IWorkflowEngine' not registered");
	}
	public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
	{
		var swi = new StartWorkflowInfo
		{
			DataSource = cmd.CurrentSource,
			Schema = cmd.CurrentSchema,
			Model = cmd.CurrentModel,
			ModelId = dataToExec.Get<Int64>("Id"),
			ActionBase = cmd.ActionBase
		};
		if (swi.ModelId == 0)
			throw new RequestModelException("Id must be specified to 'startProcess' command");
		if (!String.IsNullOrEmpty(cmd.file))
			swi.Source = $"file:{cmd.file}";
		swi.Comment = dataToExec.Get<String>("Comment");
		swi.UserId = dataToExec.Get<Int64>("UserId");
		if (swi.Source == null)
			throw new RequestModelException($"File or clrType must be specified to 'startProcess' command");
		WorkflowResult wr = await _workflowEngine.StartWorkflow(swi);
		return new ServerCommandResult(JsonConvert.SerializeObject(wr, JsonHelpers.StandardSerializerSettings));
	}
}


public class ResumeProcessCommand : IServerCommand
{
	readonly IWorkflowEngine _workflowEngine;
	public ResumeProcessCommand(IWorkflowEngine engine)
	{
		_workflowEngine = engine ?? throw new ArgumentNullException($"Service 'IWorkflowEngine' not registered");
	}

	public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
	{
		var rwi = new ResumeWorkflowInfo
		{
			Id = dataToExec.Get<Int64>("Id")
		};
		if (rwi.Id == 0)
			throw new RequestModelException("InboxId must be specified");
		rwi.UserId = dataToExec.Get<Int64>("UserId");
		rwi.Answer = dataToExec.Get<String>("Answer");
		rwi.Comment = dataToExec.Get<String>("Comment");
		rwi.Params = dataToExec.Get<ExpandoObject>("Params");
		WorkflowResult wr = await _workflowEngine.ResumeWorkflow(rwi);
		return new ServerCommandResult(JsonConvert.SerializeObject(wr, JsonHelpers.StandardSerializerSettings));
	}
}
