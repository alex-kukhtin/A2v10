// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	public enum SelectorPanelPlacement {
		Default,
		BottomLeft = Default,
		BottomRight
	}


	public class Selector : ValuedControl, ITableControl
	{
		public TextAlign Align { get; set; }
		public String Delegate { get; set; }
		public String DisplayProperty { get; set; }
		public String Placeholder { get; set; }

		public Size ListSize { get; set; }
		public UIElement NewPane { get; set; }
		public Command CreateNewCommand { get; set; }

		public UIElement ItemsPanel { get; set; }
		public SelectorPanelPlacement PanelPlacement { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			CheckDisabledModel(context);
			var input = new TagBuilder("a2-selector", null, IsInGrid);
			onRender?.Invoke(input);
			if (!String.IsNullOrEmpty(Delegate))
				input.MergeAttribute(":fetch", $"$delegate('{Delegate}')");
			input.MergeAttribute("display", DisplayProperty);
			if (PanelPlacement != SelectorPanelPlacement.Default)
				input.MergeAttribute("placement", PanelPlacement.ToString().ToKebabCase());
			if (ListSize != null)
			{
				if (!ListSize.Width.IsEmpty)
					input.MergeAttribute("list-width", ListSize.Width.ToString());
				if (!ListSize.Height.IsEmpty)
				{
					input.MergeAttribute("list-height", ListSize.Height.ToString());
				}
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
			RenderPaneTemplate(context);
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

		void RenderPaneTemplate(RenderContext context)
		{
			if (ItemsPanel == null)
				return;
			if (!(ItemsPanel is DataGrid))
				throw new XamlException("Only DataGrid panel is supported");
			var dg = ItemsPanel as DataGrid;
			var tml = new TagBuilder("template");
			tml.MergeAttribute("slot", "pane");
			tml.MergeAttribute("slot-scope", "root");
			tml.RenderStart(context);
			using (var ctx = new ScopeContext(context, "itm"))
			{
				ItemsPanel.RenderElement(context, (tag) =>
				{
					tag.MergeAttribute(":is-item-active", "root.isItemActive");
					tag.MergeAttribute(":hit-item", "root.hit");
					tag.MergeAttribute(":items-source", "root.items");
					if (ListSize != null && !ListSize.Height.IsEmpty && dg.FixedHeader)
					{
						// for fixed headers only
						tag.MergeStyle("height", ListSize.Height.ToString());
						tag.MergeStyle("max-height", ListSize.Height.ToString());
					}
				});
			}
			tml.RenderEnd(context);
		}
	}
}
