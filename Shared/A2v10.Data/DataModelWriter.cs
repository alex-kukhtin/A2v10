using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Data;
using System.Data.SqlClient;

using A2v10.Infrastructure;

namespace A2v10.Data
{
	internal class DataModelWriter
	{
		IDictionary<String, Tuple<DataTable, String>> _tables = new Dictionary<String, Tuple<DataTable, String>>();

		internal void ProcessOneMetadata(IDataReader rdr)
		{
			var rsName = rdr.GetName(0);
			var fi = rsName.Split('!');
			if ((fi.Length < 3) || (fi[2] != "Metadata"))
				throw new DataWriterException($"First field name part '{rsName}' is invalid. 'ParamName!DataPath!Metadata' expected.");
			var paramName = fi[0];
			var tablePath = fi[1];
			var tableTypeName = $"dbo.[{paramName}.TableType]";
			var table = new DataTable();
			var schemaTable = rdr.GetSchemaTable();
			/* starts from 1 */
			for (int c = 1; c < rdr.FieldCount; c++)
			{
				var ftp = rdr.GetFieldType(c);
				var fieldColumn = new DataColumn(rdr.GetName(c), ftp);
				if (ftp == typeof(String))
					fieldColumn.MaxLength = Convert.ToInt32(schemaTable.Rows[c]["ColumnSize"]);
				table.Columns.Add(fieldColumn);
			}
			_tables.Add("@" + paramName, new Tuple<DataTable, String>(table, tablePath));
		}

		internal void SetTableParameters(SqlCommand cmd, Object data, Object prms)
		{
			IDictionary<String, Object> scalarParams = SqlExtensions.GetParametersDictionary(prms);
			for (int i=0; i<cmd.Parameters.Count; i++)
			{
				SqlParameter prm = cmd.Parameters[i];
				var simpleParamName = prm.ParameterName.Substring(1); /*skip @*/
				if (prm.SqlDbType == SqlDbType.Structured)
				{
					Tuple<DataTable, String> table;
					if (_tables.TryGetValue(prm.ParameterName, out table))
					{
						// table parameters (binging by object name)
						FillDataTable(table.Item1, GetDataForSave(data as ExpandoObject, table.Item2 /*path*/));
						prm.Value = table.Item1;
						prm.RemoveDbName(); // remove first segment (database name)
					}
					else
					{
						throw new DataWriterException($"Parameter {simpleParamName} not found");
					}
				}
				else if (prm.SqlDbType == SqlDbType.VarBinary)
				{
					throw new NotImplementedException();
				}
				else
				{
					Object paramVal;
					// simple parameter
					if (scalarParams != null && scalarParams.TryGetValue(simpleParamName, out paramVal))
						prm.Value = SqlExtensions.Value2SqlValue(paramVal);
				}
			}
		}

		void FillDataTable(DataTable table, IEnumerable<ExpandoObject> data)
		{
			foreach (var d in data)
			{
				ProcessOneDataElem(table, d);
			}
		}

		void ProcessOneDataElem(DataTable table, ExpandoObject data)
		{
			var row = table.NewRow();
			var dataD = data as IDictionary<String, Object>;
			for (int c=0; c<table.Columns.Count; c++)
			{
				Object rowVal;
				var col = table.Columns[c];
				if (col.ColumnName.Contains("."))
				{
					// complex value
					if (GetComplexValue(data, col.ColumnName, out rowVal))
					{
						var dbVal = SqlExtensions.ConvertTo(rowVal, col.DataType);
						row[col.ColumnName] = dbVal;
					}
				}
				else if (dataD.TryGetValue(col.ColumnName, out rowVal))
				{
					var dbVal = SqlExtensions.ConvertTo(rowVal, col.DataType);
					row[col.ColumnName] = dbVal;
				}
			}
			table.Rows.Add(row);
		}

		bool GetComplexValue(ExpandoObject data, String expr, out Object rowVal)
		{
			rowVal = null;
			var ev = data.Eval<Object>(expr);
			if (ev != null)
			{
				rowVal = ev;
				return true;
			}
			return false;
		}

		IEnumerable<ExpandoObject> GetDataForSave(ExpandoObject data, String path, Int32? parentIndex = null)
		{
			if (String.IsNullOrEmpty(path))
				yield return data;
			var x = path.Split('.');
			var currentData = data as IDictionary<String, Object>;
			var currentId = data.Get<Object>("Id");
			for (int i = 0; i < x.Length; i++)
			{
				bool bLast = (i == (x.Length - 1));
				String prop = x[i];
				Object propValue;
				if (currentData.TryGetValue(prop, out propValue))
				{
					if (propValue is IList<Object>)
					{
						var list = propValue as IList<Object>;
						for (int j=0; j<list.Count; j++)
						{
							var currVal = list[j] as ExpandoObject;
							currVal.Set("RowNumber", j);
							currVal.Set("ParentId", currentId);
							if (parentIndex != null)
								currVal.Set("ParentRowNumber", parentIndex.Value);
							if (bLast)
								yield return currVal;
							else
							{
								String newPath = String.Empty;
								for (int k = i + 1; k < x.Length; k++)
									newPath = newPath.AppendDot(x[k]);
								foreach (var dx in GetDataForSave(currVal, newPath, j))
									yield return dx;
							}
						}
					}
					else if (propValue is ExpandoObject)
					{
						var currVal = propValue as ExpandoObject;
						if (bLast)
						{
							var propValEO = propValue as ExpandoObject;
							currVal.Set("ParentId", currentId);
							yield return currVal;
						}
						else
						{
							String newPath = String.Empty;
							for (int k = i + 1; k < x.Length; k++)
								newPath = newPath.AppendDot(x[k]);
							foreach (var dx in GetDataForSave(currVal, newPath, 0))
								yield return dx;
						}
					}
				}
			}
		}
	}
}
