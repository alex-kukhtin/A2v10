// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class Block : UIElement, ITableControl
	{

		public UIElementCollection Children { get; set; } = new UIElementCollection();

		public Length Height { get; set; }
		public Boolean Border { get; set; }
		public Boolean Scroll { get; set; }
		public TextAlign Align { get; set; }

		internal virtual void RenderChildren(RenderContext context)
		{
			foreach (var c in Children)
			{
				c.RenderElement(context);
			}
		}

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var div = new TagBuilder("div", null, IsInGrid);
			onRender?.Invoke(div);
			MergeAttributes(div, context, MergeAttrMode.Margin | MergeAttrMode.Visibility);
			if (Height != null)
				div.MergeStyle("height", Height.Value);
			div.AddCssClassBool(Border, "bordered-pane");
			div.AddCssClassBool(Scroll, "scrollable-pane");
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
