// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Dynamic;

using Newtonsoft.Json.Converters;
using Newtonsoft.Json;

using Quartz.Impl;
using Quartz;

using A2v10.Infrastructure;
using A2v10.Messaging;

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

		var mailSettings = ConfigurationManager.AppSettings["mailSettings"];
		SmtpConfig.FromJson(mailSettings);

		var dataMap = new JobDataMap
		{
			{ "DataSource", config.Get<String>("dataSource") ?? "" },
			{ "MailSettings",  SmtpConfig.FromJson(mailSettings) }
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
