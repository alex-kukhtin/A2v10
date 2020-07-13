// Copyright © 2018-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Columns")]

	public class SheetColumnGroup : SheetColumn
	{
		public SheetColumnCollection Columns { get; } = new SheetColumnCollection();
		public Object ItemsSource { get; set; }

		public override void Render(RenderContext context)
		{
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				var t = new TagBuilder("template");
				t.MergeAttribute("v-for", $"(col, colIndex) in {isBind.GetPath(context)}");
				t.RenderStart(context);
				using (new ScopeContext(context, "col"))
				{
					RenderChildren(context);
				}
				t.RenderEnd(context);

			}
			else
			{
				RenderChildren(context);
			}
		}

		void RenderChildren(RenderContext context)
		{
			foreach (var c in Columns)
				c.Render(context);
		}

		public override void RenderShadow(RenderContext context)
		{
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				var t = new TagBuilder("template");
				t.MergeAttribute("v-for", $"(col, colIndex) in {isBind.GetPath(context)}");
				t.RenderStart(context);
				using (new ScopeContext(context, "col"))
				{
					RenderShadowChildren(context);
				}
				t.RenderEnd(context);
			}
			else
			{
				RenderShadowChildren(context);
			}
		}

		void RenderShadowChildren(RenderContext context)
		{
			foreach (var c in Columns)
				c.RenderShadow(context);
		}


	}
}
