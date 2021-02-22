// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Web;
using System.IO;
using System.Collections.Specialized;

using Newtonsoft.Json;

using A2v10.Infrastructure;

namespace A2v10.Request.Api
{
	public class ApiRequest
	{
		public String HttpMethod { get; set; }
		public String Host { get; set; }

		public Int64 UserId { get; set; }
		public Int32? TenantId { get; set; }
		public String Segment { get; set; }
		public String ClientId { get; set; }
		public String Path { get; set; }

		public ExpandoObject Query { get; set; }
		public String Body { get; set; }
		public String ContentType { get; set; }

		public ExpandoObject BodyObject()
		{
			if (!String.IsNullOrEmpty(Body) && ContentType.StartsWith(MimeTypes.Application.Json))
				return JsonConvert.DeserializeObject<ExpandoObject>(Body);
			return null;
		}

		public static ApiRequest FromHttpRequest(HttpRequestBase request, String pathInfo, Action<ApiRequest> setIdentity)
		{
			String body = null;
			if (request.InputStream != null && request.InputStream.Length > 0)
			{
				request.InputStream.Seek(0, SeekOrigin.Begin); // ensure
				using (var tr = new StreamReader(request.InputStream))
				{
					body = tr.ReadToEnd();
				}
			}

			var query = new ExpandoObject();
			foreach (var key in request.QueryString.Keys) {
				var k = key?.ToString();
				var val = request.QueryString[k];
				query.SetNotEmpty(k, val);
			}
			if (query.IsEmpty())
				query = null;

			var rq = new ApiRequest()
			{
				HttpMethod = request.HttpMethod.ToLowerInvariant(),
				ContentType = request.ContentType,
				Host = request.UserHostAddress,
				//UserId = UserId,
				//Segment = UserSegment,
				//ClientId = User.Identity.GetUserClaim("ClientId"),
				Path = pathInfo?.ToLowerInvariant(),
				Query = query,
				Body = body
			};

			setIdentity(rq);

			return rq;
		}
	}
}
