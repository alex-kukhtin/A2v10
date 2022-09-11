// Copyright © 2019-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace A2v10.Javascript;

public class JsonDoubleConverter : JsonConverter<Double>
{
	public override void WriteJson(JsonWriter writer, Double value, JsonSerializer serializer)
	{
		if (Math.Truncate(value) == value)
			serializer.Serialize(writer, Convert.ToInt64(value));
		else
			writer.WriteValue(value);
	}

	public override Double ReadJson(JsonReader reader, Type objectType, Double existingValue, Boolean hasExistingValue, JsonSerializer serializer)
	{
		return serializer.Deserialize<Double>(reader);
	}
}

public class IgnoreNullValueExpandoObjectConverter : ExpandoObjectConverter
{
	public override bool CanWrite => true;

	public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
	{
		Boolean IsValueNotEmpty(Object val)
		{
			if (val == null)
				return false;
			switch (val)
			{
				case String strVal:
					return !String.IsNullOrEmpty(strVal);
				case Boolean boolVal:
					return boolVal;
				case Double doubleVal:
					return doubleVal != 0;
				case Int32 intVal:
					return intVal != 0;
			}
			return true;
		}

		if (value is IDictionary<String, Object> expando)
		{
			var dictionary = expando
				.Where(p => IsValueNotEmpty(p.Value))
				.ToDictionary(p => p.Key, p => p.Value);
			serializer.Serialize(writer, dictionary);
		}
		else
			base.WriteJson(writer, value, serializer);
	}
}
