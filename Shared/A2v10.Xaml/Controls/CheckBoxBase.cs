// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Label")]
	public abstract class CheckBoxBase : ValuedControl, ITableControl
	{
		internal abstract String ControlType { get; }
		internal abstract String InputControlType { get; }

		public TextColor Color { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			if (Hint != null)
			{
				var div = new TagBuilder("div");
				// MergeAttrMode.NoTabIndex = Visibility | Margin | Wrap | Tip | Content,
				MergeAttributes(div, context, MergeAttrMode.Visibility | MergeAttrMode.Margin);
				div.RenderStart(context);
				RenderControl(context, null, MergeAttrMode.Wrap | MergeAttrMode.Tip | MergeAttrMode.Content );
				RenderCheckboxHint(context);
				div.RenderEnd(context);
			}
			else
			{
				RenderControl(context, onRender, MergeAttrMode.NoTabIndex);
			}
		}

		void RenderControl(RenderContext context, Action<TagBuilder> onRender, MergeAttrMode mode)
		{ 
			var tag = new TagBuilder("label", ControlType, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context, mode);
			if (IsLabelEmpty)
				tag.AddCssClass("no-label");
			if (Color != TextColor.Default)
				tag.AddCssClass("text-color-" + Color.ToString().ToKebabCase());
			tag.RenderStart(context);
			var input = new TagBuilder("input");
			input.MergeAttribute("type", InputControlType);
			if (TabIndex != 0)
				input.MergeAttribute("tabindex", TabIndex.ToString());
			input.MergeAttribute("v-settabindex", String.Empty);
			MergeCheckBoxValue(input, context);
			MergeCheckBoxAttributes(input, context);
			input.Render(context, TagRenderMode.SelfClosing);
			var span = new TagBuilder("span");
			var lblBind = GetBinding(nameof(Label));
			if (lblBind != null)
			{
				span.MergeAttribute("v-text", lblBind.GetPathFormat(context));
			}
			else if (Label != null)
			{
				span.SetInnerText(Label.ToString());
			}
			span.Render(context); // always (empty too)
			tag.RenderEnd(context);
		}

		void MergeCheckBoxValue(TagBuilder input, RenderContext context)
		{
			var valBind = GetBinding(nameof(Value));
			if (valBind != null)
			{
				input.MergeAttribute("v-model", valBind.GetPath(context));
			}
		}

		internal void RenderCheckboxHint(RenderContext context)
		{
			if (Hint == null)
				return;
			if (Hint.Icon == Icon.NoIcon)
				Hint.Icon = Icon.Help;
			Hint.RenderElement(context, (t) =>
			{
				t.AddCssClass("hint");
			});
		}

		Boolean IsLabelEmpty
		{
			get
			{
				if (GetBinding(nameof(Label)) != null)
					return false;
				return Label == null;
			}
		}

		internal virtual void MergeCheckBoxAttributes(TagBuilder tag, RenderContext context)
		{
			MergeDisabled(tag, context, nativeControl: true);
		}
	}
}
