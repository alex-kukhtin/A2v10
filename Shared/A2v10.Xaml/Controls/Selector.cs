// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Selector : ValuedControl, ITableControl
	{
		public TextAlign Align { get; set; }
		public String Delegate { get; set; }
		public String DisplayProperty { get; set; }
		public String Placeholder { get; set; }

		public Size ListSize { get; set; }
		public UIElement NewPane { get; set; }
		public Command CreateNewCommand { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			CheckDisabledModel(context);
			var input = new TagBuilder("a2-selector", null, IsInGrid);
			if (onRender != null)
				onRender(input);
			if (!String.IsNullOrEmpty(Delegate))
				input.MergeAttribute(":fetch", $"$delegate('{Delegate}')");
			input.MergeAttribute("display", DisplayProperty);
			if (ListSize != null)
			{
				if (!ListSize.Width.IsEmpty)
					input.MergeAttribute("list-width", ListSize.Width.ToString());
				if (!ListSize.Height.IsEmpty)
					input.MergeAttribute("list-height", ListSize.Height.ToString());
			}
			MergeAttributes(input, context);
			MergeDisabled(input, context);
			MergeAlign(input, context, Align);
			MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
			MergeValue(input, context);
			MergeCreateNew(input, context);

			input.RenderStart(context);
			RenderAddOns(context);
			//RenderNewPane(context);
			input.RenderEnd(context);
		}

		void MergeCreateNew(TagBuilder tag, RenderContext context)
		{
			var cmd = GetBindingCommand(nameof(CreateNewCommand));
			if (cmd == null)
				return;
			tag.MergeAttribute(":create-new", "(currentText) => " + cmd.GetCommand(context, false, "currentText"));
		}

		void RenderNewPane(RenderContext context)
		{
			if (NewPane == null)
				return;
			var npTag = new TagBuilder("template");
			npTag.MergeAttribute("slot", "new-pane");
			npTag.MergeAttribute("slot-scope", "newNane");
			npTag.RenderStart(context);
			using (var ctx = new ScopeContext(context, "newPane.elem"))
			{
				NewPane.RenderElement(context);
			}
			npTag.RenderEnd(context);
		}
	}
}
