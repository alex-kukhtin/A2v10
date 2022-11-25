using Quartz.Impl;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using DocumentFormat.OpenXml.Vml;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json;
using System.Dynamic;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Quartz;

public class Scheduler
{
	public static async void Start()
	{
		var settings = ConfigurationManager.AppSettings["quartz"];
		if (settings == null)
			return;
		var config = JsonConvert.DeserializeObject<ExpandoObject>(settings, new ExpandoObjectConverter());

		IScheduler scheduler = await StdSchedulerFactory.GetDefaultScheduler();
		await scheduler.Start();

		var dataMap = new JobDataMap
		{
			{ "DataSource", config.Get<String>("dataSource") ?? "" }
		};

		var timeSpan = TimeSpan.Parse(config.Get<String>("interval"));
		var seconds = Convert.ToInt32(timeSpan.TotalSeconds);

		IJobDetail job = JobBuilder.Create<SqlServerJob>().SetJobData(dataMap).Build();

		ITrigger trigger = TriggerBuilder.Create()
			.WithIdentity("trigger", "default")
			.StartNow()
			.WithSimpleSchedule(x =>
				x.WithIntervalInSeconds(seconds)
				.RepeatForever()
			).Build();

		await scheduler.ScheduleJob(job, trigger);
	}
}
