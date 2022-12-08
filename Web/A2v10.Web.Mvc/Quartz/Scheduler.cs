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
using System.Collections.Generic;

namespace A2v10.Web.Mvc.Quartz;

public class Scheduler
{
	public static async void Start()
	{
		var settings = ConfigurationManager.AppSettings["quartz"];
		if (settings == null)
			return;
		var configList = JsonConvert.DeserializeObject<List<ExpandoObject>>(settings, new ExpandoObjectConverter());
		if (configList == null) 
			return;

		IScheduler scheduler = await StdSchedulerFactory.GetDefaultScheduler();
		await scheduler.Start();

		var mailSettings = ConfigurationManager.AppSettings["mailSettings"];
		var mailConfig = SmtpConfig.FromJson(mailSettings);

		Int32 index = 0;
		const String groupName = "default";
		foreach (var elem in configList)
		{
			index++;
			String jobName = $"job_{index}";
			String triggerName = $"trigger_{index}";

			var dataMap = new JobDataMap
			{
				{ "DataSource", elem.Get<String>("dataSource") ?? "" },
				{ "MailSettings",  mailConfig },
				{ "ConfigItem", elem }
			};

			String cronString = elem.Get<String>("cron");
			String invoke = elem.Get<String>("invoke");

			if (!CronExpression.IsValidExpression(cronString))
			{
				throw new ConfigurationErrorsException($"Invalid cron expression '{cronString}'");
			}

			var cmd = invoke switch
			{
				"commands" => JobBuilder.Create<CommandJob>(),
				"sql" => JobBuilder.Create<ExecuteSqlJob>(),
				_ => throw new ConfigurationErrorsException($"Invalid quartz invoke '{invoke}'")
			};

			IJobDetail job = cmd
				.WithIdentity(jobName, groupName)
				.SetJobData(dataMap).Build();

			ITrigger trigger = TriggerBuilder.Create()
				.WithIdentity(triggerName, groupName)
				.WithCronSchedule(cronString)
				.ForJob(jobName, groupName)
				.Build();

			await scheduler.ScheduleJob(job, trigger);
		}
	} 
}
