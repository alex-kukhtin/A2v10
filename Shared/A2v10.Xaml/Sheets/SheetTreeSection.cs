// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class SheetTreeSection : SheetSection
	{
		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var section = new TagBuilder("a2-sheet-section-tree");
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				String path = isBind.GetPath(context);
				var (Path, Prop) = SplitToPathProp(path);
				section.MergeAttribute(":items-source", Path);
				section.MergeAttribute("prop-name", Prop);
			}
			section.RenderStart(context);
			var tml = new TagBuilder("template");
			tml.MergeAttribute("slot-scope", "row");
			tml.RenderStart(context);
			using (var scope = new ScopeContext(context, "row.item"))
			{
				foreach (var r in Children)
					r.RenderElement(context, (tr) => tr.MergeAttribute(":class", "row.rowCssClass()"));
			}
			tml.RenderEnd(context);
			section.RenderEnd(context);
		}
	}
}
