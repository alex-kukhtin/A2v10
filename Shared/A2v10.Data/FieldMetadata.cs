using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	public enum FieldType
	{
		Unknown,
		String,
		Number,
		Date,
		Boolean,
		Object,
		Array
	}

	public enum SpecType
	{
		Unknown,
		Id,
		Name,
		RefId,
		ParentId
	}

	public class FieldMetadata
	{
		public FieldType Type { get; }
		public FieldType ItemType { get; } // for object, array
		public String RefObject { get; } // for object, array

		public FieldMetadata(FieldInfo fi, FieldType type)
		{
			Type = type;
			ItemType = FieldType.Unknown;
			RefObject = null;
			if (fi.IsObjectLike)
			{
				ItemType = fi.FieldType;
				RefObject = fi.TypeName;
			}
		}
	}
}
