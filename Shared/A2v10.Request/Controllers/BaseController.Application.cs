// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;
using System.Web;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public async Task ApplicationCommand(String command, Action<ExpandoObject> setParams /*Int32 tenantId, Int64 userId*/, String json, HttpResponseBase response)
		{
			switch (command.ToLowerInvariant())
			{
				case "setperiod":
					ExpandoObject dataToSet = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
					setParams?.Invoke(dataToSet);
					await _dbContext.ExecuteExpandoAsync(null, "a2user_state.SetGlobalPeriod", dataToSet);
					break;
				case "switchtocompany":
					if (!_host.IsMultiCompany)
						throw new InvalidOperationException("switchtocompany");
					ExpandoObject dataToExec = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
					break;
				default:
					throw new RequestModelException($"Invalid application command '{command}'");
			}
		}
	}
}
