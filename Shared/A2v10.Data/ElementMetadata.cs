using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	internal class ElementMetadata
	{
		public void AddProperty(FieldInfo field)
		{
			if (!field.IsVisible)
				return;
		}
	}
}
