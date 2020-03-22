// Copyright © 2020 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Web.Mvc.OAuth2;
using System;
using System.Configuration;
using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc.Hooks
{
	public class OAuth2Session
	{
		public String SessionId { get; set; }
		public String Url { get; set; }
	}

	public class GetOAuthUrl : IInvokeTarget
	{
		IApplicationHost _host;
		IDbContext _dbContext;

		public void Inject(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public async Task<Object> InvokeAsync(Int64 UserId, Int32 TenantId, String ClientId)
		{
			if (ClientId == null)
				throw new InvalidOperationException("Invalid ClientId");
			if (!(ConfigurationManager.GetSection("oauth2") is Oauth2Section oauth2Config))
				throw new InvalidOperationException("OAuth2 is not configured");
			var client = oauth2Config.clients.GetSource(ClientId);
			if (client == null)
				throw new InvalidOperationException($"client '{ClientId}' not found");

			var prms = new ExpandoObject();
			prms.Set("UserId", UserId);
			prms.Set("TenantId", TenantId);
			prms.Set("ClientId", ClientId);

			var result = await _dbContext.LoadAsync<OAuth2Session>(_host.CatalogDataSource, "a2api.[OAuth2.GetSession]", prms);
			result.Url = $"{client.url}?session_id={result.SessionId}";

			return result;
		}
	}
}
