// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

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

		internal static void ClearAttached()
		{
			_attachedFill = null;
		}

		#endregion

		public Length MinWidth { get; set; }

		String GetRows()
		{
			StringBuilder sb = new StringBuilder(); 
			foreach (var c in Children)
			{
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
			var panel = new TagBuilder("div", "full-height-panel", IsInGrid);
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
