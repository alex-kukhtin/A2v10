﻿// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	public enum ToolbarStyle
	{
		Default,
		Transparent,
		Light
	}

	public enum ToolbarBorderStyle
	{
		None,
		Bottom,
		BottomShadow
	}

	public enum ToolbarOrientation
	{
		Horizontal,
		Vertical
	}

	public class ToolbarAligner : UIElementBase
    {
        public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
			new TagBuilder("div", "aligner").Render(context);
        }
    }

	//[AttachedProperties("Align")]
	public class Toolbar : Container
	{

		public enum ToolbarAlign
		{
			Left,
			Right
		}

		#region Attached Properties
		[ThreadStatic]
		static IDictionary<Object, ToolbarAlign> _attachedPart;

		public static void SetAlign(Object obj, ToolbarAlign aln)
		{
			if (_attachedPart == null)
				_attachedPart = new Dictionary<Object, ToolbarAlign>();
			AttachedHelpers.SetAttached(_attachedPart, obj, aln);
		}

		public static ToolbarAlign GetAlgin(Object obj)
		{
			return AttachedHelpers.GetAttached(_attachedPart, obj);
		}

		internal static void ClearAttached()
		{
			_attachedPart = null;
		}

		#endregion

		public ToolbarStyle Style { get; set; }
		public ToolbarBorderStyle Border { get; set; }
		public AlignItems AlignItems { get; set; }
		public ToolbarOrientation Orientation { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tb = new TagBuilder("div", "toolbar", IsInGrid);
			onRender?.Invoke(tb);
			if (Style != ToolbarStyle.Default)
				tb.AddCssClass(Style.ToString().ToKebabCase());
			if (AlignItems != AlignItems.Default)
				tb.AddCssClass("align-" + AlignItems.ToString().ToLowerInvariant());
			if (Orientation == ToolbarOrientation.Vertical)
			tb.AddCssClass("vertical");
			MergeAttributes(tb, context);
			if (Border != ToolbarBorderStyle.None)
				tb.AddCssClass("tb-border-" + Border.ToString().ToKebabCase());
			tb.RenderStart(context);
			RenderChildren(context);
			tb.RenderEnd(context);
		}

		public override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
		{
			if (_attachedPart == null)
			{
				bool bFirstButton = true;
				base.RenderChildren(context, tag =>
                {
					if (bFirstButton && tag.TagName != "template")
					{
						tag.AddCssClass("first-elem");
						bFirstButton = false;
					}
				});
				return;
			}
			List<UIElementBase> rightList = new List<UIElementBase>();

			Boolean bFirst = true;

			foreach (var ch in Children)
			{
				if (GetAlgin(ch) == ToolbarAlign.Right)
					rightList.Add(ch);
				else
				{
					if (bFirst)
						ch.RenderElement(context, (tag) => tag.AddCssClass("first-elem"));
					else
						ch.RenderElement(context);
					bFirst = false;
				}
			}
			if (rightList.Count == 0)
				return;
			// aligner
			new TagBuilder("div", "aligner").Render(context);

			// Те, что справа
			foreach (var ch in rightList)
				ch.RenderElement(context);
		}
	}
}
