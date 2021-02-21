// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Request.Api
{
	public class ApiDataService
	{
		private readonly IApplicationHost _host;
		private readonly IApplicationReader _appReader;
		private readonly IDbContext _dbContext;
		private readonly Guid _guid;

		public ApiDataService(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_appReader = _host.ApplicationReader;
			_dbContext = dbContext;
			_guid = Guid.NewGuid();
		}

		private async Task WriteLogRequest(ApiRequest request)
		{
			var eo = new ExpandoObject();

			var msg = JsonConvert.SerializeObject(request, JsonHelpers.CompactSerializerSettings);

			eo.Set("UserId", request.UserId);
			eo.Set("Guid", _guid);
			eo.Set("Severity", (Int32) 'I');
			eo.Set("Message", $"request: {{{msg}}}");

			await _dbContext.ExecuteExpandoAsync(_host.CatalogDataSource, "[a2api].[WriteLog]", eo);
		}

		public async Task<ApiResponse> ProcessRequest(ApiRequest request)
		{
			try
			{
				await WriteLogRequest(request);

				if (String.IsNullOrEmpty(request.Path))
					throw new ArgumentOutOfRangeException("Invalid path");

				var cmd = ApiV2RequestModel.GetCommand(_appReader, request.Path);

				cmd.ValidateRequest(request);

				var handler = cmd.GetHandler(ServiceLocator.Current);

				return await handler.ExecuteAsync(request);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				//await WriteException(request, ex);

				return new ApiResponse()
				{
					ContentType = MimeTypes.Application.Json,
					Body = JsonConvert.SerializeObject(new {status = "error", message = ex.Message })
				};
			}
		}

		async Task WriteException(ApiRequest request, Exception ex)
		{
			var eo = new ExpandoObject();
			eo.Set("UserId", request.UserId);
			eo.Set("Guid", _guid);
			eo.Set("Severity", (Int32)'E');
			eo.Set("Message", $"exception: {ex.Message}");
			await _dbContext.ExecuteExpandoAsync(_host.CatalogDataSource, "[a2api].[WriteLog]", eo);
		}
	}
}
