﻿// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class Hyperlink : Inline
	{
		public Object Content { get; set; }
		public ControlSize Size { get; set; }
		public Icon Icon { get; set; }

		public Command Command { get; set; }

		public UIElement DropDown { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			Boolean bHasDropDown = DropDown != null;
			if (bHasDropDown)
			{
				DropDownDirection? dir = (DropDown as DropDownMenu)?.Direction;
				Boolean bDropUp = (dir == DropDownDirection.UpLeft) || (dir == DropDownDirection.UpRight);
				var wrap = new TagBuilder("div", "dropdown hlink-dd-wrapper", IsInGrid)
					.AddCssClass(bDropUp ? "dir-up" : "dir-down")
					.MergeAttribute("v-dropdown", String.Empty);
				if (onRender != null)
					onRender(wrap);
				wrap.RenderStart(context);
				RenderHyperlink(context, false, null);
				DropDown.RenderElement(context);
				wrap.RenderEnd(context);
			}
			else
			{
				RenderHyperlink(context, IsInGrid, onRender);
			}
		}

		void RenderHyperlink(RenderContext context, bool inGrid, Action<TagBuilder> onRender = null)
		{
			Boolean bHasDropDown = DropDown != null;

			var tag = new TagBuilder("a", "a2-hyperlink a2-inline", inGrid);
			if (onRender != null)
				onRender(tag);
			MergeAttributes(tag, context);
			MergeCommandAttribute(tag, context);
			tag.AddCssClassBool(Block, "block");

			if (Size != ControlSize.Default)
			{
				switch (Size)
				{
					case ControlSize.Small:
						tag.AddCssClass("small");
						break;
					default:
						throw new XamlException("Only ControlSize.Small is supported for the Hyperlink");
				}
			}

			if (bHasDropDown)
				tag.MergeAttribute("toggle", String.Empty);

			tag.RenderStart(context);

			RenderIcon(context, Icon);
			var cbind = GetBinding(nameof(Content));
			if (cbind != null)
			{
				new TagBuilder("span")
					.MergeAttribute("v-text", cbind.GetPathFormat(context))
					.Render(context);
			}
			else if (Content is UIElementBase)
			{
				(Content as UIElementBase).RenderElement(context);
			}
			else if (Content != null)
			{
				context.Writer.Write(context.Localize(Content.ToString()));
			}


			tag.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			if (DropDown != null && GetBinding(nameof(Command)) != null)
				throw new XamlException("Hyperlink. The DropDown and Command can't be specified at the same time");
		}
	}
}
