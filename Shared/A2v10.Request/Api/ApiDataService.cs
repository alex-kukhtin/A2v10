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
		private Int64 _userId;

		public ApiDataService(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_appReader = _host.ApplicationReader;
			_dbContext = dbContext;
			_guid = Guid.NewGuid();
		}

		private async Task WriteLogRequest(ApiRequest request)
		{
			var m = new ExpandoObject();
			m.Set("path", request.Path);
			m.SetNotEmpty("query", request.Query);
			m.SetNotEmpty("body", request.Body);
			m.SetNotEmpty("config", request.Config);
			var msg = JsonConvert.SerializeObject(m, JsonHelpers.CompactSerializerSettings);

			var eo = new ExpandoObject();

			eo.Set("UserId", request.UserId);
			eo.Set("Guid", _guid);
			eo.Set("Severity", (Int32) 'I');
			eo.Set("Message", $"request: {{{msg}}}");

			await _dbContext.ExecuteExpandoAsync(_host.CatalogDataSource, "[a2api].[WriteLog]", eo);
		}

		private async Task WriteLogResponse(ApiResponse resp)
		{
			var eo = new ExpandoObject();

			eo.Set("UserId", _userId);
			eo.Set("Guid", _guid);
			eo.Set("Severity", (Int32)'I');
			eo.Set("Message", "response: {\"status\":\"ok\"}");

			await _dbContext.ExecuteExpandoAsync(_host.CatalogDataSource, "[a2api].[WriteLog]", eo);
		}

		public async Task<ApiResponse> ProcessRequest(ApiRequest request)
		{
			_userId = request.UserId;
			try
			{
				await WriteLogRequest(request);

				if (String.IsNullOrEmpty(request.Path))
					throw new ArgumentOutOfRangeException("Invalid path");

				var cmd = ApiV2RequestModel.GetCommand(_appReader, request.Path);

				cmd.ValidateRequest(request);

				var handler = cmd.GetHandler(ServiceLocator.Current);

				var resp = await handler.ExecuteAsync(request);
				await WriteLogResponse(resp);

				return resp;
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;

				await WriteException(request, ex);

				var msg = ex.Message;
				if (!_host.IsDebugConfiguration)
					msg = "invalid request data";

				return new ApiResponse()
				{
					ContentType = MimeTypes.Application.Json,
					Body = JsonConvert.SerializeObject(new {success = false, error = msg }, JsonHelpers.CompactSerializerSettings)
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
