// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public interface IDropDownPros
	{
		DropDownDirection Direction { get; }
		Boolean Separate { get; }
		Boolean IsDropUp { get; }
	}

	public class DropDownMenu : Container, IDropDownPros
	{

		public DropDownDirection Direction { get; set; }
		public BackgroundStyle Background { get; set; }
		public Boolean Separate { get; set; }


		public Boolean IsDropUp => (Direction == DropDownDirection.UpLeft) || (Direction == DropDownDirection.UpRight);

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var menu = new TagBuilder("div", "dropdown-menu menu");
			menu.MergeAttribute("role", "menu");
			MergeAttributes(menu, context);
			if (Direction != DropDownDirection.Default)
				menu.AddCssClass(Direction.ToString().ToKebabCase());
			if (Background != BackgroundStyle.Default)
				menu.AddCssClass("background-" + Background.ToString().ToKebabCase());
			menu.RenderStart(context);
			RenderChildren(context);
			menu.RenderEnd(context);
		}
	}
}
