// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Lang
{
	public class FieldMetadata
	{
		public String Name { get; }
		public TSType Type { get; }

		public FieldMetadata(String name, TSType type)
		{
			this.Name = name;
			this.Type = type;
		}
	}

	public class TypeMetadata : Dictionary<String, FieldMetadata>
	{
		public FieldMetadata AddField(String name, TSType fieldType)
		{
			var fm = new FieldMetadata(name, fieldType);
			Add(name, fm);
			return fm;
		}
	}

	public class ModelMetadata : Dictionary<String, TypeMetadata>
	{
		public TypeMetadata AddType(String name, TSType baseType)
		{
			if (ContainsKey(name))
				throw new TSParserException($"Type '{name}' is already defined");
			var tm = new TypeMetadata();
			Add(name, tm);
			return tm;
		}
	}
}
