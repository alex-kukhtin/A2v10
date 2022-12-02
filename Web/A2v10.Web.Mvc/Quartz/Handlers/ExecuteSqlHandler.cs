// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using Quartz;

using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Quartz;

internal record SqlHandlerData
{
	public String Source { get; set; }
	public String Procedure { get; set; }

	public ExpandoObject Parameters { get; set; }

	public Int32? Timeout { get; set; }
}

internal class ExecuteSqlHandler : IJobHandler
{
	private readonly CommandJobData _job;
	private readonly IDbContext _dbContext;
	internal ExecuteSqlHandler(CommandJobData job, IServiceProvider sp)
	{
		_job = job;
		_dbContext = sp.GetService(typeof(IDbContext)) as IDbContext;
	}
	public async Task ProcessAsync(IJobExecutionContext context)
	{
		var prms = _job.GetObject<SqlHandlerData>();
		var timeout = 0;
		if (prms.Timeout.HasValue)
			timeout = prms.Timeout.Value;
		await _dbContext.ExecuteAndLoadExpandoAsync(prms.Source, prms.Procedure, prms.Parameters, timeout);
	}
}
