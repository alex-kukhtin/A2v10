// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using A2v10.Javascript;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace A2v10.Request
{
	public static class JsonHelpers
	{
		public static readonly JsonSerializerSettings StandardSerializerSettings =
			new JsonSerializerSettings()
			{
				Formatting = Formatting.Indented,
				StringEscapeHandling = StringEscapeHandling.EscapeHtml,
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DateTimeZoneHandling = DateTimeZoneHandling.Utc,
				NullValueHandling = NullValueHandling.Ignore,
				DefaultValueHandling = DefaultValueHandling.Ignore
			};

		public static readonly JsonSerializerSettings ReleaseSerializerSettings =
			new JsonSerializerSettings()
			{
				Formatting = Formatting.None,
				StringEscapeHandling = StringEscapeHandling.EscapeHtml,
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DateTimeZoneHandling = DateTimeZoneHandling.Utc,
				NullValueHandling = NullValueHandling.Ignore,
				DefaultValueHandling = DefaultValueHandling.Ignore
			};

		public static readonly JsonSerializerSettings CompactSerializerSettings =
			new JsonSerializerSettings()
			{
				Formatting = Formatting.None,
				StringEscapeHandling = StringEscapeHandling.Default,
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DateTimeZoneHandling = DateTimeZoneHandling.Utc,
				NullValueHandling = NullValueHandling.Ignore,
				DefaultValueHandling = DefaultValueHandling.Include,
				Converters = new JsonConverter[] {
					new JsonDoubleConverter()
				}
			};

		public static readonly JsonSerializerSettings CamelCaseSerializerSettings =
			new JsonSerializerSettings()
			{
				Formatting = Formatting.None,
				StringEscapeHandling = StringEscapeHandling.Default,
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DateTimeZoneHandling = DateTimeZoneHandling.Utc,
				NullValueHandling = NullValueHandling.Ignore,
				DefaultValueHandling = DefaultValueHandling.Ignore,
				ContractResolver = new DefaultContractResolver()
				{
					NamingStrategy = new CamelCaseNamingStrategy()
				}
			};


		public static JsonSerializerSettings ConfigSerializerSettings(bool bDebug)
		{
			return bDebug ? StandardSerializerSettings : ReleaseSerializerSettings;
		}
	}
}
