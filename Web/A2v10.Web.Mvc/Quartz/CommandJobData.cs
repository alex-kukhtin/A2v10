// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace A2v10.Web.Mvc.Quartz;

public class CommandJobData
{
	public Int64 Id { get; set; }
	public String Kind { get; set ;}
	public String Data { get; set; }
	public Guid Lock { get; set; }
	public ExpandoObject DataObject => 
		JsonConvert.DeserializeObject<ExpandoObject>(Data, new ExpandoObjectConverter());

	public T GetObject<T>()
	{
		return JsonConvert.DeserializeObject<T>(Data);
	}

	public static IJobHandler CreateHandler(CommandJobData job, IServiceProvider sp)
	{
		return job.Kind switch
		{
			"SendMail" => new SendMailHandler(job, sp),
			"ExecuteSql" => new ExecuteSqlHandler(job, sp),
			_ => throw new InvalidOperationException($"Invalid Job Kind ({job.Kind})"),
		};
	}
}
