// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Collections.Generic;
using System.Dynamic;

using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Request.Api
{
	public enum ApiV2CommandType
	{
		Sql
	}

	public enum HttpMethod
	{
		Any,
		Get,
		Post
	}

	public enum SqlCommandAction
	{
		LoadModel,
		UpdateModel,
		ExecuteSql
	}

	public class ApiSqlCommand
	{
		private ApiV2RequestModel _model;
		private String _id; 

		public String Source { get; set; }
		public String Schema { get; set; }
		public String Procedure { get; set; }
		public String Model { get; set; }
		public SqlCommandAction Action { get; set; }
		public Int32 CommandTimeout { get; set; }
		public ExpandoObject Parameters { get; set; }
		public String Returns { get; set; }

		internal void SetParent(ApiV2RequestModel parent)
		{
			_model = parent;
		}

		internal void SetId(String id)
		{
			_id = id;
		}

		public String RealSource => String.IsNullOrEmpty(Source) ? _model.Source : Source;
		public String RealSchema => String.IsNullOrEmpty(Schema) ? _model.Schema : Schema;
		public String RealId => _id;
	}

	public class ApiRequestCommand
	{
		private ApiV2RequestModel _model;

		#region JSON

		public ApiV2CommandType Type { get; set; }
		public ApiSqlCommand SqlCommand { get; set; }
		public HttpMethod Method { get; set; }
		public String[] ClientId { get; set; }
		public String AllowOrigin { get; set; }
		public Boolean Wrap { get; set; }
		#endregion


		internal void SetParent(ApiV2RequestModel parent)
		{
			_model = parent;
			SqlCommand?.SetParent(parent);
		}

		internal void SetId(String id)
		{
			SqlCommand?.SetId(id);
		}

		public ApiCommandHandler GetHandler(IServiceLocator serviceLocator)
		{
			switch (Type)
			{
				case ApiV2CommandType.Sql:
					return new SqlCommandHandler(serviceLocator, SqlCommand, Wrap);
			}
			throw new ApiV2Exception($"invalid command type {Type}");
		}

		public void ValidateRequest(ApiRequest request)
		{
			if (Method != HttpMethod.Any)
			{
				if (!request.HttpMethod.Equals(Method.ToString(), StringComparison.InvariantCultureIgnoreCase))
					throw new ApiV2Exception($"method not allowed");
			}
			if (ClientId != null)
			{
				if (!ClientId.Any(x => x == request.ClientId))
					throw new ApiV2Exception($"clientId not allowed");
			}
		}
	}

	public class ApiV2RequestModel
	{
		public String Source { get; set; }
		public String Schema { get; set; }

		internal void SetParent()
		{
			foreach (var cmd in Commands)
				cmd.Value.SetParent(this);
		}

		public Dictionary<String, ApiRequestCommand> Commands { get; set; } = new Dictionary<string, ApiRequestCommand>(StringComparer.InvariantCultureIgnoreCase);

		public static ApiRequestCommand GetCommand(IApplicationReader reader, String path)
		{
			var parts = path.Split('/');
			// dir/dir/dir/acton/{id};

			int len = parts.Length;
			if (len < 2)
				throw new ApiV2Exception($"invalid path: {path}");
			var p1 = String.Join("/", new ArraySegment<String>(parts, 0, len - 1));

			String id = null;
			String action = null;

			String filePath = reader.MakeFullPath($"_apiv2/{p1}", "model.json");
			if (!reader.FileExists(filePath))
			{
				// try to read with id
				if (len < 3)
					throw new ApiV2Exception($"invalid path: {path}");
				p1 = String.Join("/", new ArraySegment<String>(parts, 0, len - 2));
				filePath = reader.MakeFullPath($"_apiv2/{p1}", "model.json");
				id = parts[len - 1];
				if (!reader.FileExists(filePath))
					throw new ApiV2Exception($"path not found: {path}");
				action = parts[len - 2];
			}
			else
			{
				action = parts[len - 1];
			}

			var json = reader.FileReadAllText(filePath);
			var rm = JsonConvert.DeserializeObject<ApiV2RequestModel>(json, JsonHelpers.CamelCaseSerializerSettings);
			if (rm == null)
				throw new ApiV2Exception($"invalid model.json");
			rm.SetParent();
			if (rm.Commands.TryGetValue(action, out ApiRequestCommand cmd))
			{
				cmd.SetId(id);
				return cmd;
			}
			throw new ApiV2Exception($"command '{action}' not found");
		}
	}
}
