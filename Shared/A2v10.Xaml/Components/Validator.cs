// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;
using System.Globalization;
using System.Text;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	public enum ValidatorPlacement
	{
		TopLeft = 0,
		TopRight,
		BottomLeft,
		BottomRight
	}

	[TypeConverter(typeof(ValidatorConverter))]
	public class Validator : XamlElement
	{
		public Length Width { get; set; }
		public ValidatorPlacement? Placement { get; set; }

		public static Validator FromString(String value)
		{
			var v = new Validator();
			var arr = value.Split(',', ' ');
			if (arr.Length == 1)
			{
				v.Placement = PlacementFromString(arr[0]);
			}
			else if (arr.Length == 2)
			{
				v.Placement = PlacementFromString(arr[0]);
				v.Width = Length.FromString(arr[1]);
			}
			else
			{
				throw new XamlException($"Invalid ValidatorPlacement value '{value}'");

			}
			return v;
		}

		static ValidatorPlacement PlacementFromString(String val)
		{
			if (Enum.TryParse<ValidatorPlacement>(val, out ValidatorPlacement pl))
				return pl ;
			else
				throw new XamlException($"Invalid ValidatorPlacement value '{val}'");

		}

		internal void MergeAttributes(TagBuilder tag)
		{
			tag.MergeAttribute(":validator-options", ToJsObject());
		}

		String ToJsObject()
		{
			var sb = new StringBuilder("{");
			if (Width != null)
				sb.Append($"width:'{Width.Value}',");
			if (Placement != null)
				sb.Append($"placement: '{Placement.Value.ToString().ToKebabCase()}',");
			sb.RemoveTailComma();
			sb.Append("}");
			return sb.ToString();
		}
	}

	public class ValidatorConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(Validator))
				return true;
			return base.CanConvertFrom(context, sourceType);
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				return Validator.FromString(value.ToString());
			}
			else if (value is Validator)
			{
				return value;
			}
			return base.ConvertFrom(context, culture, value);
		}
	}

}
