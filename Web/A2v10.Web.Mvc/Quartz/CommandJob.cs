// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Dynamic;

using Quartz;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Quartz;

public class CommandJob : IJob
{
	private readonly IDbContext _dbContext;
	private readonly IHttpService _httpService;
	public CommandJob()
	{
		_dbContext = LocalDbContext.Create();
		_httpService = new LocalHttpService();
	}
	public async Task Execute(IJobExecutionContext context)
	{
		var dataSource = context.MergedJobDataMap["DataSource"]?.ToString() ?? String.Empty;

		try
		{
			var list = await _dbContext.LoadListAsync<CommandJobData>(dataSource, "a2bg.[Command.List]", null);
			if (list == null || list.Count == 0)
				return;

			var sp = new ServiceProvider();
			sp.RegisterService<IDbContext>(_dbContext);
			sp.RegisterService<IHttpService>(_httpService);

			foreach (var itm in list)
			{
				await ProcessJob(itm, context, sp, dataSource);
			}
		}
		catch (Exception ex)
		{
			await QuartzHelpers.WriteException(_dbContext, dataSource, "command", ex);
		}
	}

	private async Task ProcessJob(CommandJobData job, IJobExecutionContext context, IServiceProvider sp, String dataSource)
	{
		try
		{
			await CommandJobData.CreateHandler(job, sp)
				.ProcessAsync(context);
			await WriteComplete(dataSource, job, true);
		}
		catch (Exception ex)
		{
			await WriteComplete(dataSource, job, false, ex);
		}
	}

	private Task WriteComplete(String dataSource, CommandJobData job, Boolean success, Exception ex = null)
	{
		var prms = new ExpandoObject()
		{
			{"Id", job.Id },
			{"Complete", success },
			{"Lock", job.Lock }
		};

		if (ex != null)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			prms.Add("Error", ex.Message);
		}
		return _dbContext.ExecuteExpandoAsync(dataSource, "a2bg.[Command.Complete]", prms);
	}
}
