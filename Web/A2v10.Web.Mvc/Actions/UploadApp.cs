// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Dynamic;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc.Actions;

public class UploadApp : IInvokeTarget
{

	private IApplicationHost _host;
	private IDbContext _dbContext;
	public void Inject(IApplicationHost host, IDbContext dbContext)
	{
		_host = host;
		_dbContext = dbContext;	
	}

	public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, String FileName, String model, String schema)
	{
		var appReader = _host.ApplicationReader;
		var text = await appReader.ReadTextFileAsync("../_apps", Path.ChangeExtension(FileName, ".json")) 
			?? throw new FileNotFoundException($"Application file '{FileName}' not found");
        var data = JsonConvert.DeserializeObject<ExpandoObject>(text);
		var prms = new ExpandoObject()
		{
			{"UserId", UserId },
		};
		if (TenantId != 0)
			prms.Add("TenantId", TenantId);
		var res = await _dbContext.SaveModelAsync(_host.TenantDataSource, $"[{schema}].[{model}.Update]", data, prms);
		return res.Root;
	}
}
