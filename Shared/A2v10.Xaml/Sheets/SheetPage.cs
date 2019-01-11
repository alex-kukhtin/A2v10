using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class SheetPage : Container
	{
		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var wrap = new TagBuilder("div", "sheet-page-wrapper", IsInGrid);
			MergeAttributes(wrap, context);
			wrap.RenderStart(context);
			var page = new TagBuilder("div", "sheet-page portrait");
			page.RenderStart(context);
			RenderChildren(context);
			page.RenderEnd(context);
			wrap.RenderEnd(context);
		}
	}
}
