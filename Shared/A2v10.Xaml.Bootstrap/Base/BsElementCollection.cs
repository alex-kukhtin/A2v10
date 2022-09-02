// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml.Bootstrap;

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
		if (value is String valString)
			return new BsElementCollection
			{
				new Span() {Content = valString }
			};
		else if (value is BsElement valBsElem)
			return new BsElementCollection
			{
				valBsElem
			};
		return base.ConvertFrom(context, culture, value);
	}
}
