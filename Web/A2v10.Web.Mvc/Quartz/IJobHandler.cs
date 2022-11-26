// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System.Threading.Tasks;
using Quartz;

namespace A2v10.Web.Mvc.Quartz;

public interface IJobHandler
{
	public Task ProcessAsync(IJobExecutionContext context);
}
