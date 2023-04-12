using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebExtensionSample;

public class QuarzInvokeClrSample : IInvokeClrHandler
{
	private readonly IDbContext _dbContext;
	public QuarzInvokeClrSample(IServiceProvider serviceProvider)
	{
		_dbContext = serviceProvider.GetService(typeof(IDbContext)) as IDbContext;
	}
	public Task InvokeAsync(ExpandoObject data)
	{
		var dat = JsonConvert.SerializeObject(data);
		throw new InvalidOperationException(dat);
	}
}
