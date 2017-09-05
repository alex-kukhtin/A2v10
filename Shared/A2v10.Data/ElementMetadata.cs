
using System;
using System.Collections.Generic;

namespace A2v10.Data
{
    public class ElementMetadata
    {
        IDictionary<String, FieldMetadata> _fields = new Dictionary<String, FieldMetadata>();

        public String Id { get; private set; }
        public String Name { get; private set; }
        public String RowNumber { get; private set; }

        public String Items { get; private set; }
        public Boolean IsArrayType { get; set; }
        public Boolean IsRowCount { get; set; }

        internal IDictionary<String, FieldMetadata> Fields { get { return _fields; } }

        public FieldMetadata AddField(FieldInfo field, DataType type)
		{
			if (!field.IsVisible)
				return null;
            FieldMetadata fm;
			if (IsFieldExists(field.PropertyName, type, out fm))
				return fm;
			fm = new FieldMetadata(field, type);
			_fields.Add(field.PropertyName, fm);
			switch (field.SpecType)
			{
				case SpecType.Id:
					Id = field.PropertyName;
					break;
				case SpecType.Name:
					Name = field.PropertyName;
					break;
                case SpecType.RowNumber:
                    RowNumber = field.PropertyName;
                    break;
                case SpecType.RowCount:
                    IsRowCount = true;
                    break;
			}
            return fm;
		}

		public Int32 FieldCount { get { return _fields.Count; } }

		public Boolean ContainsField(String field)
		{
			return _fields.ContainsKey(field);
		}

		bool IsFieldExists(String name, DataType dataType, out FieldMetadata fm)
		{
			if (_fields.TryGetValue(name, out fm))
			{
				if (fm.DataType != dataType)
					throw new DataLoaderException($"Invalid property '{name}'. Type mismatch.");
				return true;
			}
			return false;
		}

        public FieldMetadata GetField(String name)
        {
            FieldMetadata fm;
            if (_fields.TryGetValue(name, out fm))
            {
                return fm;
            }
            throw new DataLoaderException($"Field '{name}' not found.");
        }
    }
}
