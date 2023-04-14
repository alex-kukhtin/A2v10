using System;
using System.Dynamic;
using System.Net.Http;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace WebExtensionSample;

public class QuarzInvokeClrSample : IInvokeClrHandler
{
	private readonly IDbContext _dbContext;
	private readonly IHttpService _httpService;
	public QuarzInvokeClrSample(IServiceProvider serviceProvider)
	{
		_dbContext = serviceProvider.GetService(typeof(IDbContext)) as IDbContext;
		_httpService = serviceProvider.GetService(typeof(IHttpService)) as IHttpService;
	}
	public async Task InvokeAsync(IInvokeContext context, ExpandoObject data)
	{
		var dat = JsonConvert.SerializeObject(data);
		throw new InvalidOperationException(dat);
	}
}
