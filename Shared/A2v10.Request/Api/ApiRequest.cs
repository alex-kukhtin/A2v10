// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using Newtonsoft.Json;
using System;
using System.Dynamic;

namespace A2v10.Request.Api
{
	public class ApiRequest
	{
		public String HttpMethod { get; set; }

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
			if (!String.IsNullOrEmpty(Body) && ContentType.StartsWith("application/json"))
				return JsonConvert.DeserializeObject<ExpandoObject>(Body);
			return null;
		}
	}
}
