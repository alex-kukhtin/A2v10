// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public abstract class Control : UIElement
	{
		public Boolean Block { get; set; }

		public String Label { get; set; }

		public String Description { get; set; }

		public Boolean Required { get; set; }

		public Boolean Disabled { get; set; }

		public Int32 TabIndex { get; set; }

		public Length Width { get; set; }

		public Validator Validator { get; set; }

		Lazy<UIElementCollection> _addOns = new Lazy<UIElementCollection>();

		public UIElementCollection AddOns { get { return _addOns.Value; } }

		internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			base.MergeAttributes(tag, context, mode);
			tag.AddCssClassBool(Block, "block");
			AddControlAttributes(tag, context);
			if (TabIndex != 0 && mode.HasFlag(MergeAttrMode.TabIndex))
				tag.MergeAttribute(":tab-index", TabIndex.ToString());
			if (Width != null)
			{
				tag.MergeStyle("width", Width.Value);
				tag.AddCssClass("with-width");
			}
		}

		private void AddControlAttributes(TagBuilder tag, RenderContext context)
		{
			MergeBindingAttributeString(tag, context, "label", nameof(Label), Label);
			MergeBindingAttributeString(tag, context, "description", nameof(Description), Description);
			MergeBoolAttribute(tag, context, nameof(Required), Required);
			if (Validator != null)
			{
				Validator.MergeAttributes(tag);
			}
		}

		internal void RenderAddOns(RenderContext context)
		{
			if (!_addOns.IsValueCreated)
				return;
			foreach (var ctl in AddOns)
			{
				ctl.RenderElement(context, (tag) =>
				{
					tag.AddCssClass("add-on");
					tag.MergeAttribute("tabindex", "-1");
					MergeDisabled(tag, context, nativeControl: true);
				});
			}
		}

		internal virtual void MergeDisabled(TagBuilder tag, RenderContext context, Boolean nativeControl = false)
		{
			// may override the disabled attribute from the command
			var disBind = GetBinding(nameof(Disabled));
			if (disBind != null)
				tag.MergeAttribute(":disabled", disBind.GetPath(context), replaceExisting: true);
			else if (Disabled)
			{
				if (nativeControl)
					tag.MergeAttribute("disabled", String.Empty, replaceExisting: true);
				else
					tag.MergeAttribute(":disabled", "true", replaceExisting: true); // jsValue
			}
		}

		internal void CheckDisabledModel(RenderContext context)
		{
			if (context.IsDataModelIsReadOnly)
			{
				Disabled = true;
				RemoveBinding(nameof(Disabled));
			}
		}
	}
}
