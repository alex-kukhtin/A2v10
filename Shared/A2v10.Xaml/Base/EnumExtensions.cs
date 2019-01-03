// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public static class EnumExtensions
	{
		public static String AlignSelf(this VerticalAlign vAlign)
		{
			switch (vAlign)
			{
				case VerticalAlign.Top:
					return "start";
				case VerticalAlign.Middle:
					return "center";
				case VerticalAlign.Bottom:
					return "end";
				default:
					return null;
			}
		}

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
	}
}
