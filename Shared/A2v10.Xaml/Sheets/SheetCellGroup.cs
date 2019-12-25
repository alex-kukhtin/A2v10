// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Cells")]
	public class SheetCellGroup : SheetCell
	{
		public SheetCells Cells { get; } = new SheetCells();
		public Object ItemsSource { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				var t = new TagBuilder("template");
				t.MergeAttribute("v-for", $"(cell, cellIndex) in {isBind.GetPath(context)}");
				t.RenderStart(context);
				using (new ScopeContext(context, "cell"))
				{
					RenderChildren(context);
				}
				t.RenderEnd(context);

			} else
			{
				RenderChildren(context);
			}
		}

		void RenderChildren(RenderContext context)
		{
			foreach (var c in Cells)
				c.RenderElement(context);
		}
	}
}
