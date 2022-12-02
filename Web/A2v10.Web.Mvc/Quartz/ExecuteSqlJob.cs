// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using DocumentFormat.OpenXml.Spreadsheet;
using Quartz;

namespace A2v10.Web.Mvc.Quartz;

public class ExecuteSqlJob : IJob
{
	private readonly IDbContext _dbContext;
	public ExecuteSqlJob()
	{
		_dbContext = LocalDbContext.Create();
	}
	public async Task Execute(IJobExecutionContext context)
	{
		var dataSource = context.MergedJobDataMap["DataSource"]?.ToString() ?? String.Empty;
		var config = context.MergedJobDataMap["ConfigItem"] as ExpandoObject ?? new ExpandoObject();
		try
		{
			var proc = config.Get<String>("procedure");
			var prms = config.Get<ExpandoObject>("parameters") ?? new ExpandoObject();
			await _dbContext.ExecuteExpandoAsync(dataSource, proc, prms);
		}
		catch (Exception ex)
		{
			await QuartzHelpers.WriteException(_dbContext, dataSource, config.Get<String>("id"), ex);
		}
	}
}
