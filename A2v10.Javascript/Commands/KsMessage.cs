// Copyright © 2022 Alex Kukhtin. All rights reserved.

using System;

using Newtonsoft.Json.Converters;
using Newtonsoft.Json;

namespace A2v10.Javascript
{
	public enum KsBearerType
	{
		sms,
		viber
	}

	public class KsResponse
	{
		public Boolean success { get; set; }
		public String mid { get; set; }
		public Int32 errorId { get; set; }
		public String errorMsg { get; set; }
	}

	public class KsMessage
	{
		public String source { get; private set; }
		public String destination { get; private set; }
		public String serviceType { get; private set; }

		[JsonConverter(typeof(StringEnumConverter))]
		public KsBearerType bearerType { get; private set; }
		public String contentType { get; private set; }
		public String content { get; private set; }

		private static String NormalizePhone(String phone)
		{
			if (phone.StartsWith("+"))
				phone = phone.Substring(1);
			return phone;
		}
		public static KsMessage SmsMessage(String source, String phone, String text)
		{

			return new KsMessage()
			{
				source = source,
				serviceType = "104",
				bearerType = KsBearerType.sms,
				contentType = "text/plain",
				content = text,
				destination = NormalizePhone(phone),
			};
		}

		public static KsMessage ViberMessage(String phone, String text)
		{
			return new KsMessage()
			{
				source = "18008",
				bearerType = KsBearerType.viber,
				contentType = "text/plain",
				content = text,
				destination = NormalizePhone(phone),
			};
		}
	}
}
