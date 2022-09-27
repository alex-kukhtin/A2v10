// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public static class EnumExtensions
	{
		public static String AlignSelf(this AlignItem vAlign)
		{
			switch (vAlign)
			{
				case AlignItem.Top:
				case AlignItem.Start:
					return "start";
				case AlignItem.Middle:
				case AlignItem.Center:
					return "center";
				case AlignItem.Bottom:
				case AlignItem.End:
					return "end";
				case AlignItem.Stretch:
					return "stretch";
				default:
					return null;
			}
		}

		public static String ToClass(this Overflow? overflow)
		{
			if (overflow == null)
				return null;
			switch (overflow)
			{
				case Overflow.Visible:
					return "of-visible";
				case Overflow.Hidden:
					return "of-hidden";
				case Overflow.Auto:
					return "of-auto";
			}
			return null;
		}
	}
}
