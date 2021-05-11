// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Web;
using System.IO;

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
		public ExpandoObject Body { get; set; }
		public String ContentType { get; set; }
		public ExpandoObject Config { get; set; }

		static ExpandoObject FromApplicationJson(HttpRequestBase request)
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
			if (body != null)
				return JsonConvert.DeserializeObject<ExpandoObject>(body);
			return null;
		}

		static ExpandoObject FromFormData(HttpRequestBase request)
		{
			var eo = new ExpandoObject();
			foreach (var key in request.Form.AllKeys)
			{
				eo.SetNotEmpty(key, request.Form[key]);
			}
			if (request.Files != null && request.Files.Count > 0)
			foreach (var f in request.Files.AllKeys)
			{
				eo.Set(f, request.Files[f].InputStream);
			}
			if (eo.IsEmpty())
				return null;
			return eo;
		}

		static ExpandoObject FromXml(HttpRequestBase request)
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
			throw new NotImplementedException("ApiRequest.FromXml");
		}

		public static ApiRequest FromHttpRequest(HttpRequestBase request, String pathInfo, Action<ApiRequest> setIdentity)
		{
			ExpandoObject body = null;
			if (request.ContentType.StartsWith(MimeTypes.Application.Json))
				body = FromApplicationJson(request);
			else if (request.ContentType.StartsWith(MimeTypes.Application.FormData))
				body = FromFormData(request);
			else if (request.ContentType.StartsWith(MimeTypes.Application.Xml) || request.ContentType.StartsWith(MimeTypes.Text.Xml))
				body = FromXml(request);

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
				Path = pathInfo?.ToLowerInvariant(),
				Query = query,
				Body = body
			};

			setIdentity(rq);

			return rq;
		}
	}
}
