using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	public static class DataHelpers
	{
		public static FieldType TypeName2FieldType(this String s)
		{
			switch (s)
			{
				case "DateTime":
					return FieldType.Date;
				case "String":
					return FieldType.String;
				case "Int64":
				case "Int32":
				case "Double":
				case "Decimal":
					return FieldType.Number;
				case "Boolean":
					return FieldType.Boolean;
				case "Object":
					return FieldType.Object;
				case "Array":
					return FieldType.Array;

			}
			return FieldType.Unknown;
		}

		public static SpecType TypeName2SpecType(this String s)
		{
			switch (s)
			{
				case "Id":
					return SpecType.Id;
				case "Name":
					return SpecType.Name;
				case "ParentId":
					return SpecType.ParentId;
				case "RefId":
					return SpecType.RefId;
			}
			return SpecType.Unknown;
		}

		public static void Add(this ExpandoObject eo, String key, Object value)
		{
			var d = eo as IDictionary<String, Object>;
			d.Add(key, value);
		}

		public static void AddToArray(this ExpandoObject eo, String key, ExpandoObject value)
		{
			var d = eo as IDictionary<String, Object>;
			Object objArr;
			List<ExpandoObject> arr;
			if (!d.TryGetValue(key, out objArr))
			{
				arr = new List<ExpandoObject>();
				d.Add(key, arr);
			} else
			{
				arr = objArr as List<ExpandoObject>;
			}
			arr.Add(value);
		}

	}
}
