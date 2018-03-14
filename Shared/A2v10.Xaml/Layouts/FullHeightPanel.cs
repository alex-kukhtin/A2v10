using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class FullHeightPanel : Container
	{
		#region Attached Properties
		static Lazy<IDictionary<Object, Boolean>> _attachedFill = new Lazy<IDictionary<Object, Boolean>>(() => new Dictionary<Object, Boolean>());

		public static void SetFill(Object obj, Boolean fill)
		{
			AttachedHelpers.SetAttached(_attachedFill, obj, fill);
		}

		public static Boolean? GetFill(Object obj)
		{
			return AttachedHelpers.GetAttached(_attachedFill, obj);
		}
		#endregion

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
			panel.MergeStyle("grid-template-rows", GetRows());
			panel.RenderStart(context);
			RenderChildren(context);
			panel.RenderEnd(context);
		}
	}
}
