// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Request.Api
{
	public class SqlCommandHandler : ApiCommandHandler
	{
		private readonly IDbContext _dbContext;
		private readonly ApiSqlCommand _command;
		public SqlCommandHandler(IServiceLocator serviceLocator, ApiSqlCommand command)
		{
			_dbContext = serviceLocator.GetService<IDbContext>();
			_command = command;
		}

		public override Task<ApiResponse> ExecuteAsync(ApiRequest request)
		{
			switch (_command.Action)
			{
				case SqlCommandAction.LoadModel:
					return LoadModelAsync(request);
				case SqlCommandAction.UpdateModel:
					return UpdateModelAsync(request);
				case SqlCommandAction.ExecuteSql:
					return ExecuteSqlAsync(request);
			}
			throw new ApiV2Exception($"invalid sql action {_command.Action}");
		}

		private async Task<ApiResponse> LoadModelAsync(ApiRequest request)
		{ 
			var sql = $"[{_command.RealSchema}].[{_command.Model}.Load]";

			var prms = CreateParameters(request);
			var dm = await _dbContext.LoadModelAsync(_command.RealSource, sql, prms, _command.CommandTimeout);

			return ModelResponse(dm);
		}

		private async Task<ApiResponse> UpdateModelAsync(ApiRequest request)
		{
			var sql = $"[{_command.RealSchema}].[{_command.Model}.Update]";

			var prms = CreateParameters(request);
			var dm = await _dbContext.SaveModelAsync(_command.RealSource, sql, request.BodyObject(), prms);

			return ModelResponse(dm);
		}


		private async Task<ApiResponse> ExecuteSqlAsync(ApiRequest request)
		{
			var sql = $"[{_command.RealSchema}].[{_command.Procedure}]";
			var prms = CreateParameters(request);
			var eo = await _dbContext.ExecuteAndLoadExpandoAsync(_command.RealSource, sql, prms, _command.CommandTimeout);
			if (!String.IsNullOrEmpty(_command.Returns))
				eo = eo.Eval<ExpandoObject>(_command.Returns);

			var resp = new ApiResponse()
			{
				ContentType = MimeTypes.Application.Json,
			};

			if (eo != null)
				resp.Body = JsonConvert.SerializeObject(eo, JsonHelpers.CompactSerializerSettings);
			else
				resp.Body = "{\"status\":\"ok\"}";
			return resp;
		}

		ApiResponse ModelResponse(IDataModel dm)
		{ 
			var model = dm.Root;
			if (!String.IsNullOrEmpty(_command.Returns))
				model = model.Eval<ExpandoObject>(_command.Returns);

			return new ApiResponse()
			{
				ContentType = MimeTypes.Application.Json,
				Body = JsonConvert.SerializeObject(model, JsonHelpers.CompactSerializerSettings)
			};
		}

		ExpandoObject CreateParameters(ApiRequest request)
		{
			var rq = new ExpandoObject();
			rq.Set("id", _command.RealId);
			rq.Set("body", request.BodyObject());
			rq.Set("query", request.Query);

			var eo = new ExpandoObject();
			eo.Set("UserId", request.UserId);
			if (request.TenantId != null)
				eo.Set("TenantId", request.TenantId);

			if (_command.Parameters != null)
			{
				foreach (var p in _command.Parameters)
				{
					// key - name, value => path
					eo.Set(p.Key, rq.Eval<Object>(p.Value.ToString()));
				}
			}
			return eo;
		}
	}
}
