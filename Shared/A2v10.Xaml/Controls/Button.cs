// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public enum ButtonStyle
	{
		Default = 0,
		Primary = 1,
		Danger = 2,
		Warning = 3,
		Info = 4,
		Success = 5,
		Green = Success,
		Orange = Warning,
		Red = Danger,
		Cyan = Info,
	}

	public enum IconAlign
	{
		Default = 0,
		Left = 0,
		Top = 1,
	}

	public class Button : CommandControl
	{
		public Icon Icon { get; set; }
		public UIElementBase DropDown { get; set; }
		public ButtonStyle Style { get; set; }
		public ControlSize Size { get; set; }
		public IconAlign IconAlign { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			Boolean bHasDropDown = DropDown != null;
			if (bHasDropDown)
			{
				var ddm = (DropDown as DropDownMenu);
				DropDownDirection? dir = ddm?.Direction;
				Boolean? separate = ddm?.Separate;
				Boolean bDropUp = ddm != null && ddm.IsDropUp;
				Boolean insideBar = IsParentCommandBar || IsParentToolBar;

				var wrap = new TagBuilder("div", "dropdown")
					.AddCssClass(bDropUp ? "dir-up" : "dir-down")
					.MergeAttribute("v-dropdown", String.Empty);
				MergeVisibilityAttribures(wrap, context);
				onRender?.Invoke(wrap);
				if (!Block && !insideBar)
					wrap.AddCssClass("a2-inline");
				if (separate != null)
					wrap.AddCssClassBool(separate.Value, "separate");

				wrap.RenderStart(context);
				RenderButton(context, true, bDropUp, onRender);
				DropDown.RenderElement(context);
				wrap.RenderEnd(context);
			}
			else
			{
				RenderButton(context, false, false, onRender);
			}
		}

		void AddSize(TagBuilder tag)
		{
			switch (Size)
			{
				case ControlSize.Large:
					tag.AddCssClass("lg");
					break;
				case ControlSize.Small:
					tag.AddCssClass("sm");
					break;
				case ControlSize.Mini:
					tag.AddCssClass("xs");
					break;
			}

		}
		void RenderButton(RenderContext context, Boolean hasDropDown, Boolean bDropUp, Action<TagBuilder> onRender)
		{
			var parentCB = IsParentCommandBar;
			var parentTB = IsParentToolBar;
			Boolean hasCommand = GetBindingCommand(nameof(Command)) != null;
			Boolean insideBar = IsParentToolBar || IsParentCommandBar;
			var button = new TagBuilder("button", "btn", IsInGrid);
			onRender?.Invoke(button);
			if (!Block && !insideBar)
				button.AddCssClass("a2-inline");
			if (Parent is Toolbar && Style == ButtonStyle.Default)
				button.AddCssClass("btn-tb");
			else if (IsParentCommandBar)
				button.AddCssClass("btn-cb");
			AddSize(button);
			if (IconAlign == IconAlign.Top)
				button.AddCssClass("icon-top");

			//if (!insideBar)
			if (Style != ButtonStyle.Default)
				button.AddCssClass($"btn-{Style.ToString().ToLowerInvariant()}");
			if (hasDropDown && !hasCommand)
				button.MergeAttribute("toggle", String.Empty);
			MergeAttributes(button, context, MergeAttrMode.NoTabIndex); // dinamic
			if (TabIndex != 0)
				button.MergeAttribute("tabindex", TabIndex.ToString());
			if (!HasContent && (Icon != Icon.NoIcon))
				button.AddCssClass("btn-icon");
			MergeDisabled(button, context, nativeControl: true);
			button.MergeAttribute("v-settabindex", String.Empty);
			button.RenderStart(context);
			RenderIcon(context, Icon);
			RenderContent(context);
			if (hasDropDown)
			{
				if (!hasCommand)
					RenderCaret(context, bDropUp);
			}
			button.RenderEnd(context);
			if (hasDropDown && hasCommand)
			{
				var open = new TagBuilder("button", "btn btn-caret")
					.MergeAttribute("toggle", String.Empty);
				if (Style != ButtonStyle.Default)
					open.AddCssClass($"btn-{Style.ToString().ToLowerInvariant()}");
				MergeVisibilityAttribures(open, context); // Visible only
				AddSize(open);
				open.RenderStart(context);
				RenderCaret(context, bDropUp);
				open.RenderEnd(context);
			}
		}

		void RenderCaret(RenderContext context, Boolean bDropUp)
		{
			if (Content == null && Icon != Icon.NoIcon)
				return; // icon only
			var btn = new TagBuilder("span", "caret")
				.AddCssClassBool(bDropUp, "up");
			btn.Render(context);
		}

		public Boolean IsParentCommandBar => FindParent<CommandBar>() != null;
		public Boolean IsParentToolBar => FindParent<Toolbar>() != null;
	}
}
