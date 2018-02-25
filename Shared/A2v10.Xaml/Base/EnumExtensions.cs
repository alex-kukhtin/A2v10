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
	}
}
