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
			Name = name;
			Type = type;
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
		private Dictionary<String, TSType> _declares;
		private HashSet<String> _enums;

		public TypeMetadata AddType(String name, TSType baseType)
		{
			if (ContainsKey(name))
				throw new TSParserException($"Type '{name}' is already defined");
			var tm = new TypeMetadata();
			Add(name, tm);
			return tm;
		}

		public void AddDeclare(String name, TSType type)
		{
			if (_declares == null)
				_declares = new Dictionary<String, TSType>();
			_declares.Add(name, type);
		}

		public void AddEnum(String name)
		{
			if (_enums == null)
				_enums = new HashSet<String>();
			_enums.Add(name);
		}

		public TSType GetDeclare(String name)
		{
			if (_declares != null && _declares.ContainsKey(name))
				return _declares[name];
			return null;
		}

		public TypeMetadata FindType(String name)
		{
			var dt = GetDeclare(name);
			if (dt != null)
				name = dt.RealType;
			if (ContainsKey(name))
				return this[name];
			return null;
		}

		public Boolean IsEnum(String name)
		{
			return _enums != null && _enums.Contains(name);
		}
	}
}
