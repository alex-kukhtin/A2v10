// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class Block : UIElement, ITableControl
	{

		public UIElementCollection Children { get; set; } = new UIElementCollection();

		public Length Height { get; set; }
		public Length Width { get; set; }
		public Boolean Border { get; set; }
		public Boolean Scroll { get; set; }
		public TextAlign Align { get; set; }
		public TextColorStyle Color { get; set; }

		internal virtual void RenderChildren(RenderContext context)
		{
			foreach (var c in Children)
			{
				c.RenderElement(context);
			}
		}

		void AddHackedBorder(TagBuilder pane)
		{
			if (!Scroll) return;
			if (Children.Count != 1) return;
			if (Children[0] is Table tab)
			{
				if (tab.Border || tab.GridLines == GridLinesVisibility.Both || tab.GridLines == GridLinesVisibility.Horizontal)
					pane.AddCssClass("child-border");
			}
		}

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var div = new TagBuilder("div", null, IsInGrid);
			onRender?.Invoke(div);
			MergeAttributes(div, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
			if (Height != null)
				div.MergeStyle("height", Height.Value);
			if (Width != null)
				div.MergeStyle("width", Width.Value);
			div.AddCssClassBool(Border, "bordered-pane");
			div.AddCssClassBool(Scroll, "scrollable-pane");
			AddHackedBorder(div);
			if (Color != TextColorStyle.Default)
				div.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
			MergeAlign(div, context, Align);
			div.RenderStart(context);
			RenderChildren(context);
			div.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var c in Children)
				c.SetParent(this);
		}

		internal override void OnDispose()
		{
			base.OnDispose();
			foreach (var c in Children)
				c.OnDispose();
		}
	}
}
