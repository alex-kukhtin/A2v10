// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Text;

namespace A2v10.Xaml.Drawing
{
	[TypeConverter(typeof(PointConverter))]
	public class Point
	{
		public Int32 X { get; set; }
		public Int32 Y { get; set; }

		public Point()
		{
		}

		public Point(String str)
		{
			var arr = str.Split(',');
			if (arr.Length > 1)
			{
				X = Int32.Parse(arr[0]);
				Y = Int32.Parse(arr[1]);
			} else
			{
				throw new XamlException($"Invalid point value '{str}'");
			}
		}
	}

	[TypeConverter(typeof(PointCollectionConverter))]
	public class PointCollection : List<Point>
	{
		public static PointCollection FromString(String value)
		{
			var p = new PointCollection();
			var arr = value.Split(';');
			for (var i=0; i<arr.Length; i++)
			{
				p.Add(new Point(arr[i]));
			}
			return p;
		}

		public String ToPath()
		{
			var sb = new StringBuilder();
			for (var i=0; i<this.Count; i++)
			{
				var p = this[i];
				var cmd = i == 0 ? 'M' : 'L';
				sb.Append($"{cmd}{p.X},{p.Y} ");
			}
			return sb.ToString();
		}
	}

	public class PointCollectionConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(Point))
				return true;
			return base.CanConvertFrom(context, sourceType);
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				return PointCollection.FromString(value.ToString());
			}
			else if (value is Point)
			{
				return new PointCollection()
				{
					value as Point
				};
			}
			return base.ConvertFrom(context, culture, value);
		}
	}
	public class PointConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(Point))
				return true;
			return base.CanConvertFrom(context, sourceType);
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				return new Point(value.ToString());
			}
			else if (value is Point)
			{
				return value;
			}
			return base.ConvertFrom(context, culture, value);
		}
	}
}
