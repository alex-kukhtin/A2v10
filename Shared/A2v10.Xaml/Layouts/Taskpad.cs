// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	public enum TaskpadPosition
	{
		Right,
		Left,
	}

	[ContentProperty("Children")]
	public class Taskpad : Container
	{

		public Length Width { get; set; }
		public BackgroundStyle Background { get; set; }
		public Boolean? Collapsible { get; set; }
		public String Title { get; set; }
		public Boolean Overflow { get; set; }
		public Boolean Collapsed { get; set; }

		public TaskpadPosition Position { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-taskpad", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			MergeBindingAttributeString(tag, context, "title", nameof(Title), Title);
			tag.AddCssClassBool(Overflow, "overflow");
			tag.MergeStyle("grid-column", Position == TaskpadPosition.Left ? "1" : "2");

			if (Width != null)	
				tag.MergeAttribute("initial-width", Width.Value);

			if (Background != BackgroundStyle.Default)
				tag.AddCssClass("background-" + Background.ToString().ToKebabCase());

			tag.AddCssClassBoolNo(Collapsible, "collapsible");

			tag.MergeAttribute("position", Position.ToString().ToLowerInvariant());
			var colBind = GetBinding(nameof(Collapsed));
			if (colBind != null)
				tag.MergeAttribute(":initial-collapsed", colBind.GetPath(context));
			else
				tag.MergeAttribute(":initial-collapsed", Collapsed.ToString().ToLowerInvariant());

			tag.RenderStart(context);
			RenderChildren(context);
			tag.RenderEnd(context);
		}
	}
}
