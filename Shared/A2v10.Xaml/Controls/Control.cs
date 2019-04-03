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
		public Popover Popover { get; set; }
		public String TestId { get; set; }
		public Popover Hint { get; set; }
		public UIElement Link { get; set; }

		Lazy<UIElementCollection> _addOns = new Lazy<UIElementCollection>();

		public UIElementCollection AddOns { get { return _addOns.Value; } }

		internal override void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
		{
			base.MergeAttributes(tag, context, mode);
			tag.AddCssClassBool(Block, "block");
			if (Popover != null)
				tag.AddCssClass("with-popover");
			AddControlAttributes(tag, context);
			if (TabIndex != 0 && mode.HasFlag(MergeAttrMode.TabIndex))
				tag.MergeAttribute(":tab-index", TabIndex.ToString());
			if (Width != null)
			{
				tag.MergeStyle("width", Width.Value);
				tag.AddCssClass("with-width");
			}
			if (!String.IsNullOrEmpty(TestId) && context.IsDebugConfiguration)
				tag.MergeAttribute("test-id", TestId);
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
			RenderPopover(context);
			RenderHint(context);
			RenderLink(context);
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

		internal void RenderPopover(RenderContext context)
		{
			if (Popover == null)
				return;
			var tag = new TagBuilder("template");
			tag.MergeAttribute("slot", "popover");
			tag.RenderStart(context);
			Popover.RenderElement(context);
			tag.RenderEnd(context);
		}

		internal void RenderHint(RenderContext context)
		{
			if (Hint == null)
				return;
			if (Hint.Icon == Icon.NoIcon)
				Hint.Icon = Icon.Help;
			var tag = new TagBuilder("template");
			tag.MergeAttribute("slot", "hint");
			tag.RenderStart(context);
			Hint.RenderElement(context, (t) =>
			{
				t.AddCssClass("hint");
			});
			tag.RenderEnd(context);
		}

		internal void RenderLink(RenderContext context)
		{
			if (Link == null)
				return;
			var tag = new TagBuilder("template");
			tag.MergeAttribute("slot", "link");
			tag.RenderStart(context);
			Link.RenderElement(context, (t) =>
			{
				t.AddCssClass("control-link");
			});
			tag.RenderEnd(context);
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

		internal virtual Boolean SkipCheckReadOnly()
		{
			return false;
		}

		internal Boolean CheckDisabledModel(RenderContext context)
		{
			var rm = GetRenderMode(context);
			if (rm == RenderMode.Hide)
				return true;
			if (rm == RenderMode.Debug)
				return context.IsDebugConfiguration ? false : true;
			if (rm == RenderMode.Show)
				return false; // skip read only
			if (context.IsDataModelIsReadOnly || rm == RenderMode.ReadOnly)
			{
				if (SkipCheckReadOnly())
					return false;
				Disabled = true;
				RemoveBinding(nameof(Disabled));
			}
			return false;
		}
	}
}
