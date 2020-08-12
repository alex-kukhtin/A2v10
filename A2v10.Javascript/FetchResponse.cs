// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Net;
using Newtonsoft.Json;

namespace A2v10.Javascript
{

	public class FetchResponse
	{
		internal FetchResponse(HttpStatusCode status, String contentType, String body, ExpandoObject headers, String statusText = "OK")
		{
			this.status = status;
			this.contentType = contentType;
			this.body = body;
			this.statusText = statusText;
			this.headers = headers;
		}

#pragma warning disable IDE1006 // Naming Styles
		public Boolean ok => ((int) status >= 200) && ((int) status <= 299);
		public String statusText { get; }
		public HttpStatusCode status { get; }
		public String contentType { get; }
		public String body { get; }
		public Boolean isJson => contentType.StartsWith("application/json");
		public ExpandoObject headers { get; }
#pragma warning restore IDE1006 // Naming Styles

#pragma warning disable IDE1006 // Naming Styles
		public ExpandoObject json()
#pragma warning restore IDE1006 // Naming Styles
		{
			if (isJson)
				return JsonConvert.DeserializeObject<ExpandoObject>(body);
			throw new InvalidOperationException($"The answer is not in application/json format");
		}

#pragma warning disable IDE1006 // Naming Styles
		public String text()
#pragma warning restore IDE1006 // Naming Styles
		{
			return body;
		}
	}
}
