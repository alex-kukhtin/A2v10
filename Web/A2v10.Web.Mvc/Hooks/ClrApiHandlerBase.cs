// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Request.Api;

namespace A2v10.Web.Mvc.Hooks
{
	public class ClrApiHandlerBase
	{
		public IApiResponse Ok()
		{
			var error = new ExpandoObject()
			{
				{ "success", true },
			};
			return new ApiResponse()
			{
				ContentType = MimeTypes.Application.Json,
				Body = JsonConvert.SerializeObject(error, JsonHelpers.StandardSerializerSettings)
			};
		}

		public IApiResponse Ok(ExpandoObject resp)
		{
			var obj = new ExpandoObject()
			{
				{ "success", true },
				{ "result", resp },
			};
			return new ApiResponse()
			{
				ContentType = MimeTypes.Application.Json,
				Body = JsonConvert.SerializeObject(obj, JsonHelpers.StandardSerializerSettings)
			};
		}

		public IApiResponse Fail(String message)
		{
			var error = new ExpandoObject()
			{
				{ "success", false },
				{ "error", message}
			};
			return new ApiResponse()
			{
				ContentType = MimeTypes.Application.Json,
				Body = JsonConvert.SerializeObject(error, JsonHelpers.StandardSerializerSettings)
			};
		}
	}
}
