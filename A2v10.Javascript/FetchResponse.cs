// Copyright © 2020-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Net;
using Jint.Native;
using Newtonsoft.Json;

namespace A2v10.Javascript;

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
	public Object json()
	{
		if (isJson)
		{
			if (IsBodyArray())
				return JsonConvert.DeserializeObject<List<ExpandoObject>>(body);
			return JsonConvert.DeserializeObject<ExpandoObject>(body);
		}
		throw new InvalidOperationException($"The answer is not in application/json format");
	}
	private Boolean IsBodyArray()
	{
		for (int i=0; i<body.Length; i++) {
			if (body[i] == '[')
				return true;
			else if (body[i] == '{')
				return false;
		}
		return false;

	}

#pragma warning restore IDE1006 // Naming Styles

#pragma warning disable IDE1006 // Naming Styles
	public String text()
#pragma warning restore IDE1006 // Naming Styles
	{
		return body;
	}
}
