// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class SheetSection : UIElement
	{
		public Object ItemsSource { get; set; }

		public SheetRows Children { get; } = new SheetRows();

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var sect = new TagBuilder("a2-sheet-section");
			MergeAttributes(sect, context);
			sect.RenderStart(context);
			var tml = new TagBuilder("template");
			var isBind = GetBinding(nameof(ItemsSource));
			if (isBind != null)
			{
				tml.MergeAttribute("v-for", $"(item, itemIndex) of {isBind.GetPath(context)}");
				tml.RenderStart(context);
				using (var scope = new ScopeContext(context, "item"))
				{
					foreach (var r in Children)
						r.RenderElement(context);
				}
				tml.RenderEnd(context);
			}
			else
			{
				tml.RenderStart(context);
				foreach (var r in Children)
					r.RenderElement(context);
				tml.RenderEnd(context);
			}
			sect.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var r in Children)
				r.SetParent(this);
		}

		internal override void OnSetStyles()
		{
			base.OnSetStyles();
			foreach (var r in Children)
				r.OnSetStyles();
		}
	}

	public class SheetSections : List<SheetSection>
	{

	}

}
