// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Text;

namespace A2v10.Xaml
{
	public class FullHeightPanel : Container
	{
		#region Attached Properties
		[ThreadStatic]
		static IDictionary<Object, Boolean> _attachedFill;
		[ThreadStatic]
		static IDictionary<Object, Boolean> _attachedSkip;

		public static void SetFill(Object obj, Boolean fill)
		{
			if (_attachedFill == null)
				_attachedFill = new Dictionary<Object, Boolean>();
			AttachedHelpers.SetAttached(_attachedFill, obj, fill);
		}

		public static Boolean? GetFill(Object obj)
		{
			return AttachedHelpers.GetAttached(_attachedFill, obj);
		}

		public static void SetSkip(Object obj, Boolean skip)
		{
			if (_attachedSkip == null)
				_attachedSkip = new Dictionary<Object, Boolean>();
			AttachedHelpers.SetAttached(_attachedSkip, obj, skip);
		}

		public static Boolean? GetSkip(Object obj)
		{
			return AttachedHelpers.GetAttached(_attachedSkip, obj);
		}


		internal static void ClearAttached()
		{
			_attachedFill = null;
			_attachedSkip = null;
		}

		#endregion

		public Length MinWidth { get; set; }

		String GetRows()
		{
			StringBuilder sb = new StringBuilder(); 
			foreach (var c in Children)
			{
				var skip = GetSkip(c);
				if (skip.HasValue && skip.Value)
					continue;
				var fill = GetFill(c);
				if (fill.HasValue && fill.Value)
					sb.Append("1fr ");
				else
					sb.Append("auto ");
			}
			return sb.ToString();
		}

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var panel = new TagBuilder("div", "full-height-panel", IsInGrid);
			panel.MergeAttribute("key", Guid.NewGuid().ToString()); // disable vue reusing
			MergeAttributes(panel, context);
			if (MinWidth != null)
				panel.MergeStyleUnit("min-width", MinWidth.Value);
			panel.MergeStyle("grid-template-rows", GetRows());
			panel.RenderStart(context);
			RenderChildren(context);
			panel.RenderEnd(context);
		}
	}
}
