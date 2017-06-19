
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Dynamic;
using System.Globalization;
using System.IO;

namespace A2v10.Data
{
	public static class SqlExtensions
	{
		public static SqlCommand CreateCommandSP(this SqlConnection cnn, String command)
		{
			var cmd = cnn.CreateCommand();
			cmd.CommandText = command;
			cmd.CommandType = CommandType.StoredProcedure;
			return cmd;
		}

		public static void RemoveDbName(this SqlParameter prm)
		{
			Int32 dotPos = prm.TypeName.IndexOf('.');
			if (dotPos != -1)
			{
				prm.TypeName = prm.TypeName.Substring(dotPos + 1);

				dotPos = prm.TypeName.IndexOf('.');
				// wrap TypeName into []
				var newName = $"[{prm.TypeName.Substring(0, dotPos)}].[{prm.TypeName.Substring(dotPos + 1)}]";
				prm.TypeName = newName;
			}
		}

		public static IDictionary<String, Object> GetParametersDictionary(Object prms)
		{
			if (prms == null)
				return null;
			if (prms is ExpandoObject)
				return prms as IDictionary<String, Object>;
			var retDict = new Dictionary<String, Object>();
			var props = prms.GetType().GetProperties();
			foreach (var p in props)
			{
				retDict.Add(p.Name, p.GetValue(prms, null));
			}
			return retDict;
		}

		public static Object Value2SqlValue(Object value)
		{
			if (value == null)
				return DBNull.Value;
			return value;
		}

		public static Object ConvertTo(Object value, Type to)
		{
			if (value == null)
				return DBNull.Value;
			else if (value is ExpandoObject)
			{
				var id = (value as ExpandoObject).Get<Object>("Id");
				if (id == null)
					return DBNull.Value;
				return Convert.ChangeType(id, to, CultureInfo.InvariantCulture);
			}
			else if (value is String)
			{
				var str = value.ToString();
				if (String.IsNullOrEmpty(str))
					return DBNull.Value;
				return value;
			}
			else
			{
				return Convert.ChangeType(value, to, CultureInfo.InvariantCulture);
			}
		}
	}
}
