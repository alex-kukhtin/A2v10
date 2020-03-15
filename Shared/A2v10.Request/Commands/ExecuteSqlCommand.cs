// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Interop;
using Newtonsoft.Json;

namespace A2v10.Request
{
	public class ExecuteSqlCommand : IServerCommand
	{
		private readonly IDbContext _dbContext;

		public ExecuteSqlCommand(IDbContext dbContext)
		{
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
		}

		public async Task<ServerCommandResult> Execute(RequestCommand cmd, ExpandoObject dataToExec)
		{
			if (String.IsNullOrEmpty(cmd.procedure))
				throw new RequestModelException("A procedure must be specified for sql-type command");
			IDataModel model = await _dbContext.LoadModelAsync(cmd.CurrentSource, cmd.CommandProcedure, dataToExec, cmd.commandTimeout);
			String invokeTarget = cmd.GetInvokeTarget();
			if (invokeTarget != null)
			{
				var clr = new ClrInvoker();
				clr.EnableThrow();
				clr.Invoke(invokeTarget, dataToExec); // after execute
			}
			var r = new ServerCommandResult();
			if (model == null)
				r.Data = "{}";
			else
				r.Data = JsonConvert.SerializeObject(model.Root, JsonHelpers.StandardSerializerSettings);
			return r;
		}
	}
}
