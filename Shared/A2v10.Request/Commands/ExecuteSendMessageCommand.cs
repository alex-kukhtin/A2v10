// Copyright © 2019-2023 Oleksandr  Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Request;

public class ExecuteSendMessageCommand : IServerCommand
{
	private readonly IApplicationHost _host;
	private readonly IMessaging _messaging;

	public ExecuteSendMessageCommand(IApplicationHost host, IMessaging messaging)
	{
		_host = host ?? throw new ArgumentNullException(nameof(host));
		_messaging = messaging ?? throw new ArgumentNullException(nameof(messaging));

	}
	public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
	{
		var r = new ServerCommandResult();
		var qm = _messaging.CreateQueuedMessage();
		var prms = cmd.parameters;
		qm.Key = prms.Get<String>("key");
		qm.Template = prms.Get<String>("template");
		qm.TargetId = dataToExec.Eval<Int64>("Id", 0);
		if (qm.TargetId == 0)
		{
			// try get id from cmd.Id
			if (cmd?.Id != null)
				qm.TargetId = Int64.Parse(cmd.Id);
		}
		qm.Source = "ServerCommand";
		qm.Parameters.Append(dataToExec);
		bool immediately = true;
		if (prms.HasProperty(nameof(immediately)))
			immediately = prms.Get<Boolean>(nameof(immediately));
		long msgId = await _messaging.QueueMessageAsync(qm, immediately);
		if (immediately)
			await _messaging.SendMessageAsync(msgId);
		r.Data = $"{{\"status\":\"success\", \"id\":{msgId}}}";
		return r;
	}
}
