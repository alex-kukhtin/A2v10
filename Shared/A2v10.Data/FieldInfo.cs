using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	public struct FieldInfo
	{
		public String PropertyName { get; }
		public String TypeName { get; }
		public String FieldType { get; }

		public FieldInfo(String name)
		{
			PropertyName = null;
			TypeName = null;
			FieldType = null;
			var x = name.Split('!');
			if (x.Length > 0)
				PropertyName = x[0];
			if (x.Length > 1)
				TypeName = x[1];
			if (x.Length > 2)
				FieldType = x[2];
		}

		public Boolean IsVisible { get { return !String.IsNullOrEmpty(PropertyName); } }

		public Boolean IsArray { get { return FieldType == "Array"; } }
		public Boolean IsObject { get { return FieldType == "Object"; } }

	}
}
