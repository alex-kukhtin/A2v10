using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	public enum DataType
	{
		Undefined,
		String,
		Number,
		Date,
		Boolean,
	}

	public enum FieldType
	{
		Scalar,
		Object,
		Array,
		Map
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
		public DataType DataType { get; }
		public FieldType ItemType { get; } // for object, array
		public String RefObject { get; } // for object, array

		public FieldMetadata(FieldInfo fi, DataType type)
		{
			DataType = type;
			ItemType = FieldType.Scalar;
			RefObject = null;
			if (fi.IsObjectLike)
			{
				ItemType = fi.FieldType;
				RefObject = fi.TypeName;
			}
		}
	}
}
