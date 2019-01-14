
// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class DropDownMegaMenu : Container
	{
		public DropDownDirection Direction { get; set; }
		public BackgroundStyle Background { get; set; }

		public String GroupBy { get; set; }
		public Int32 Columns { get; set; }
		public Length Width { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var menu = new TagBuilder("mega-menu");
			MergeAttributes(menu, context);
			if (Direction != DropDownDirection.Default)
				menu.AddCssClass(Direction.ToString().ToKebabCase());
			if (Background != BackgroundStyle.None)
				menu.AddCssClass("background-" + Background.ToString().ToKebabCase());
			var itms = GetBinding(nameof(ItemsSource));
			if (itms == null)
				throw new XamlException("DropDownMegaMenu. ItemsSource binging must be specified");

			menu.MergeAttribute(":items-source", itms.GetPath(context));
			menu.MergeAttribute("group-by", GroupBy);
			menu.MergeAttribute(":columns", Columns.ToString());
			if (Width != null)
				menu.MergeAttribute("width", Width.Value);

			menu.RenderStart(context);

			if (Children.Count != 1)
				throw new XamlException("DropDownMegaMenu. MenuItem must be specified");

			if (!(Children[0] is MenuItem mi))
				throw new XamlException("DropDownMegaMenu. MenuItem must be specified");

			var tml = new TagBuilder("template");
			tml.MergeAttribute("slot", "item");
			tml.MergeAttribute("slot-scope", "slotItem");
			tml.RenderStart(context);
			using (new ScopeContext(context, "slotItem.menuItem"))
			{
				mi.RenderElement(context);
			}
			tml.RenderEnd(context);
			menu.RenderEnd(context);
		}
	}
}
