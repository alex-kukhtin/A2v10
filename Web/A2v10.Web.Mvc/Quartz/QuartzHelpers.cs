using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Configuration;

namespace A2v10.Web.Mvc.Quartz;

internal static class QuartzHelpers
{
	public static Task WriteException(IDbContext dbContext, String dataSource, String id, Exception ex)
	{
		if (ex.InnerException != null)
			ex = ex.InnerException;
		String message = ex.Message;
		if (message.Length > 255)
			message = message.Substring(0, 255);
		return dbContext.ExecuteExpandoAsync(dataSource, "a2bg.[Exception]", new ExpandoObject()
			{
				{ "JobId", id  },
				{ "Message", message }
			});

	}
}
