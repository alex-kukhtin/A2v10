// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Label")]
	public abstract class CheckBoxBase : ValuedControl, ITableControl
	{
		internal abstract String ControlType { get; }
		internal abstract String InputControlType { get; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			CheckDisabledModel(context);
			var tag = new TagBuilder("label", ControlType, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context, MergeAttrMode.NoTabIndex);
			if (IsLabelEmpty)
				tag.AddCssClass("no-label");
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
