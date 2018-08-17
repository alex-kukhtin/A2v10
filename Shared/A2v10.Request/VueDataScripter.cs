// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Text;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Request
{
	public class VueDataScripter : IDataScripter
	{
		public String CreateScript(IDictionary<String, Object> sys, IDictionary<String, IDataMetadata> meta)
		{
			var sb = new StringBuilder();
			sb.AppendLine("function modelData(template, data) {");
			sb.AppendLine("const cmn = require('std:datamodel');");
			if (meta != null)
			{
				sb.Append(GetConstructors(meta));
			}
			sb.AppendLine("cmn.implementRoot(TRoot, template, ctors);");
			sb.AppendLine("let root = new TRoot(data);");
			sb.Append(SetModelInfo(sys));
			sb.AppendLine();
			sb.AppendLine("return root;");
			sb.AppendLine("}");
			return sb.ToString();
		}

		public String CreateEmptyStript()
		{
			var sb = new StringBuilder();
			sb.AppendLine("function modelData(template, data) {");
			sb.AppendLine("const cmn = require('std:datamodel');");
			sb.AppendLine("function TRoot(source, path, parent) {");
			sb.AppendLine("cmn.createObject(this, source, path, parent);}");
			sb.AppendLine("cmn.defineObject(TRoot, { props: { } }, false);");
			sb.AppendLine("const ctors = {TRoot};");
			sb.AppendLine("cmn.implementRoot(TRoot, template, ctors);");
			sb.AppendLine("let root = new TRoot(data);");
			sb.AppendLine("cmn.setModelInfo(root, {}, rawData); return root;}");
			return sb.ToString();
		}

		public StringBuilder SetModelInfo(IDictionary<String, Object> sys)
		{
			if (sys == null)
				return null;
			var sb = new StringBuilder("cmn.setModelInfo(root, {\n");
			foreach (var k in sys)
			{
				var val = k.Value;
				if (val is Boolean)
					val = val.ToString().ToLowerInvariant();
				else if (val is String)
					val = $"'{val}'";
				else if (val is Object)
					val = JsonConvert.SerializeObject(val);
				sb.Append($"'{k.Key}': {val},");
			}
			sb.RemoveTailComma();
			sb.Append("}, rawData);");
			return sb;
		}

		public StringBuilder GetConstructors(IDictionary<String, IDataMetadata> meta)
		{
			if (meta == null)
				return null;
			var sb = new StringBuilder();
			foreach (var m in meta)
			{
				sb.Append(GetOneConstructor(m.Key, m.Value));
				sb.AppendLine();
			}
			// make ctors
			sb.Append("const ctors = {");
			foreach (var re in meta)
			{
				sb.Append(re.Key).Append(",");
				if (re.Value.IsArrayType)
					sb.Append(re.Key + "Array").Append(",");
			}
			sb.RemoveTailComma();
			sb.AppendLine("};");
			return sb;
		}

		public StringBuilder GetOneConstructor(String name, IDataMetadata ctor)
		{
			var sb = new StringBuilder();
			String arrItem = ctor.IsArrayType ? "true" : "false";

			sb.AppendLine($"function {name}(source, path, parent) {{")
			.AppendLine("cmn.createObject(this, source, path, parent);")
			.AppendLine("}")
			// metadata
			.Append($"cmn.defineObject({name}, {{props: {{")
			.Append(GetProperties(ctor))
			.Append("}")
			.Append(GetSpecialProperties(ctor))
			.AppendLine($"}}, {arrItem});");

			if (ctor.IsArrayType)
			{
				sb.AppendLine($"function {name}Array(source, path, parent) {{")
				.AppendLine($"return cmn.createArray(source, path, {name}, {name}Array, parent);")
				.AppendLine("}");
			}
			return sb;
		}

		public StringBuilder GetProperties(IDataMetadata meta)
		{
			var sb = new StringBuilder();
			foreach (var fd in meta.Fields)
			{
				var fm = fd.Value;
				String propObj = fm.GetObjectType($"{meta.Name}.{fd.Key}");
				if (propObj == "String")
					propObj = $"{{type:String, len:{fm.Length}}}";
				else if (propObj == "TPeriod")
					propObj = $"{{type: uPeriod.constructor}}";
				sb.Append($"'{fd.Key}'")
				.Append(':')
				.Append(propObj)
				.Append(",");
			}
			if (sb.Length == 0)
				return sb;
			sb.RemoveTailComma();
			return sb;
		}

		public String GetSpecialProperties(IDataMetadata meta)
		{
			StringBuilder sb = new StringBuilder();
			if (!String.IsNullOrEmpty(meta.Id))
				sb.Append($"$id: '{meta.Id}',");
			if (!String.IsNullOrEmpty(meta.Name))
				sb.Append($"$name: '{meta.Name}',");
			if (!String.IsNullOrEmpty(meta.RowNumber))
				sb.Append($"$rowNo: '{meta.RowNumber}',");
			if (!String.IsNullOrEmpty(meta.HasChildren))
				sb.Append($"$hasChildren: '{meta.HasChildren}',");
			if (!String.IsNullOrEmpty(meta.Permissions))
				sb.Append($"$permissions: '{meta.Permissions}',");
			if (!String.IsNullOrEmpty(meta.Items))
				sb.Append($"$items: '{meta.Items}',");
			if (meta.IsGroup)
				sb.Append($"$group: true,");
			StringBuilder lazyFields = new StringBuilder();
			foreach (var f in meta.Fields)
			{
				if (f.Value.IsLazy)
					lazyFields.Append($"'{f.Key}',");
			}
			if (lazyFields.Length != 0)
			{
				lazyFields.RemoveTailComma();
				sb.Append($"$lazy: [{lazyFields.ToString()}]");
			}
			if (sb.Length == 0)
				return null;
			sb.RemoveTailComma();
			return ",\n" + sb.ToString();
		}
	}
}
