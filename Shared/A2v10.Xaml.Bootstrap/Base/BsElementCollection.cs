using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml.Bootstrap
{
	[TypeConverter(typeof(BsCollectionConverter))]
	public class BsElementCollection : List<BsElement>
	{
		public BsElementCollection()
		{

		}
	}

	public class BsCollectionConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(BsElement))
				return true;
			return base.CanConvertFrom(context, sourceType);
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				throw new NotImplementedException("Convert string to BsElementCollection");
				var x = new BsElementCollection
				{
				};
				return x;
			}
			else if (value is BsElement)
			{
				var x = new BsElementCollection
				{
					value as BsElement
				};
				return x;
			}
			return base.ConvertFrom(context, culture, value);
		}
	}
}
