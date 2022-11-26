// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc.Quartz;

public enum JobKind
{
	SendMail = 100
}

public class BackgroundJob
{
	public Int64 Id { get; set; }
	public JobKind Kind { get; set ;}
	public String Data { get; set; }
	public Guid Lock { get; set; }
	public ExpandoObject DataObject => 
		JsonConvert.DeserializeObject<ExpandoObject>(Data, new ExpandoObjectConverter());
	public static IJobHandler CreateHandler(BackgroundJob job, IServiceProvider sp)
	{
		switch (job.Kind)
		{
			case JobKind.SendMail:
				return new SendMailHandler(job, sp);
		}
		throw new InvalidOperationException($"Invalid Job Kind ({job.Kind})");
	}
}
