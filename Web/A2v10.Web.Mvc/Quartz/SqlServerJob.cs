// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using Quartz;

using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Quartz;

public class BackgroundJob
{

}

public class SqlServerJob : IJob
{
	private readonly IDbContext _dbContext;
	public SqlServerJob()
	{
		_dbContext = LocalDbContext.Create();
	}
	public async Task Execute(IJobExecutionContext context)
	{
		try
		{
			var dataSource = context.MergedJobDataMap["DataSource"]?.ToString() ?? String.Empty;

			var list = await _dbContext.LoadListAsync<BackgroundJob>(dataSource, "quarz.[Job.Pending]", null);
			if (list == null || list.Count == 0)
				return;
		} 
		catch (Exception ex)
		{
			int z = 55;
		}
	}
}
