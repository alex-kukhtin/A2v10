// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;

namespace A2v10.Data
{
	public struct FieldInfo
	{
		public String PropertyName { get; }
		public String TypeName { get; }
		public FieldType FieldType { get; }
		public SpecType SpecType { get; }
		public Boolean IsComplexField { get; }
        public Boolean IsLazy { get; }

		public FieldInfo(String name)
		{
			PropertyName = null;
			TypeName = null;
			FieldType = FieldType.Scalar;
			SpecType = SpecType.Unknown;
            IsLazy = false;
			var x = name.Split('!');
			if (x.Length > 0)
				PropertyName = x[0];
            CheckField(x);
			if (x.Length > 1)
			{
				TypeName = x[1];
				FieldType = FieldType.Object;
			}
			if (x.Length > 2)
			{
				FieldType = DataHelpers.TypeName2FieldType(x[2]);
				if (FieldType == FieldType.Scalar || FieldType == FieldType.Array)
					SpecType = DataHelpers.TypeName2SpecType(x[2]);
                IsLazy = x[2].Contains("Lazy");
            }
            IsComplexField = PropertyName.Contains('.');
		}


		public FieldInfo(FieldInfo source, String name)
		{
            // for complex fields only
			PropertyName = name;
			TypeName = null;
			FieldType = FieldType.Scalar;
			SpecType = source.SpecType;
			IsComplexField = false;
            IsLazy = false;
		}


		public Boolean IsVisible { get { return !String.IsNullOrEmpty(PropertyName); } }

		public Boolean IsArray { get { return FieldType == FieldType.Array; } }
		public Boolean IsObject { get { return FieldType == FieldType.Object; } }
		public Boolean IsMap { get { return FieldType == FieldType.Map; } }
		public Boolean IsTree { get { return FieldType == FieldType.Tree; } }
        public Boolean IsGroup { get { return FieldType == FieldType.Group; } }

        public Boolean IsObjectLike { get { return IsArray || IsObject || IsTree || IsGroup; } }

		public Boolean IsRefId { get { return SpecType == SpecType.RefId; } }
		public Boolean IsParentId { get { return SpecType == SpecType.ParentId; } }
		public Boolean IsId { get { return SpecType == SpecType.Id; } }
        public Boolean IsRowCount { get { return SpecType == SpecType.RowCount; } }
        public Boolean IsItems { get { return SpecType == SpecType.Items; } }
        public Boolean IsGroupMarker { get { return SpecType == SpecType.GroupMarker; } }

        private static void CheckField(String[] parts)
        {
            if (parts.Length == 2)
            {
                var p1 = parts[1];
                SpecType st;
                if (SpecType.TryParse(p1, out st))
                {
                    // A special type is specified, but there are only two parts in the field name
                    throw new DataLoaderException($"Invalid field name '{String.Join("!", parts)}'");
                }
            }
        }
    }
}
