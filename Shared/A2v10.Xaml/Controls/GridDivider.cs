// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class GridDivider : UIElementBase
	{
		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var t = new TagBuilder("div", "grid-divider", IsInGrid);
			t.Render(context);
		}
	}
}
