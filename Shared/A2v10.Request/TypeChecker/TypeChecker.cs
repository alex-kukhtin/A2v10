// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Linq;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Lang;

namespace A2v10.Request
{
	public class TypeChecker : ITypeChecker
	{
		private ModelMetadata _mm;
		private readonly IApplicationReader _reader;
		private readonly String _path;

		public TypeChecker(IApplicationReader reader, String path)
		{
			_reader = reader;
			_path = path;
		}

		public void CreateChecker(String fileName, IDataModel model)
		{
			var parser = new TSDefParser(_reader, _path);
			_mm = parser.Parse(fileName);

			if (model == null || model.Metadata == null)
				throw new TypeCheckerException($"TypeChecker. Date model is empty");

			foreach (var kv in model.Metadata)
			{
				if (!_mm.ContainsKey(kv.Key))
					throw new TypeCheckerException($"Type '{kv.Key}' is in the model but not found in the description file");
				CheckFields(kv.Key, kv.Value, _mm[kv.Key]);
			}
			foreach (var kv in _mm.Where(x => !x.Key.StartsWith("$")))
			{
				if (!model.Metadata.ContainsKey(kv.Key))
					throw new TypeCheckerException($"Type '{kv.Key}' is in the description file but not found in data model");
			}
		}

		void CheckFields(String typeName, IDataMetadata data, TypeMetadata typeMeta)
		{
			foreach (var fv in data.Fields) {
				if (!typeMeta.ContainsKey(fv.Key))
					throw new TypeCheckerException($"Type '{typeName}'. Field '{fv.Key}' is in the model but not found in the description file");
				var dfm = typeMeta[fv.Key];
				CheckType(typeName, dfm, fv.Value);
			}
			foreach (var fm in typeMeta.Where(x => !x.Key.StartsWith("$")))
			{
				if (!data.Fields.ContainsKey(fm.Key))
					throw new TypeCheckerException($"Type '{typeName}'. Field '{fm.Key}' is in the description file but not found in the model");
			}
		}

		void CheckType(String typeName, FieldMetadata fileField, IDataFieldMetadata dataField)
		{
			var fieldType = fileField.Type.TypeName;
			var dataType = dataField.TypeScriptName;
			if (fieldType != dataType) {
				var tm = _mm.GetDeclare(fieldType);
				if (tm != null && tm.TypeName == dataType)
					return;
				throw new TypeCheckerException($"Type '{typeName}'. Field '{fileField.Name}'. Incompatible types. (model: '{dataType}', description: '{fieldType}') ");
			}
		}

		FieldMetadata CalcExpression(String expression)
		{
			if (expression == null)
				return null;
			if (expression.StartsWith("Parent."))
				return null;
			if (expression.Contains(".$selected"))
				return null;
			var segments = expression.Split('.');
			var currentType = _mm["TRoot"];
			var len = segments.Length;
			for (var i = 0; i < len; i++)
			{
				var seg = segments[i];
				if (seg == "Root")
				{
					currentType = _mm["TRoot"];
					continue;
				}
				if (!currentType.ContainsKey(seg))
					throw new TypeCheckerException($"Xaml. Field not found '{expression}'");
				if (i != len - 1)
				{
					var typeName = currentType[seg];
					if (!_mm.ContainsKey(typeName.Type.RealType))
						throw new TypeCheckerException($"Xaml. Field not found '{expression}'");
					currentType = _mm[typeName.Type.RealType];
				}
				else
				{
					return currentType[seg];
				}
			}
			return null;
		}

		public void CheckXamlExpression(String expression)
		{
			CalcExpression(expression);
		}

		public void CheckTypedXamlExpression(String expression, TypeCheckerTypeCode typeCode)
		{
			var type = CalcExpression(expression).Type;
			var codeString = TypeCodeToString(typeCode);
			if (type.TypeName != codeString)
				throw new TypeCheckerException($"Xaml. Path='{expression}'. Incompatible types. Expected:'{codeString}', Actual:'{type.TypeName}'");
		}

		String TypeCodeToString(TypeCheckerTypeCode code) { 
			switch (code)
			{
				case TypeCheckerTypeCode.Boolean:
				case TypeCheckerTypeCode.String:
					return code.ToString().ToLowerInvariant();
				default:
					return code.ToString();
			}
		}

	}
}
