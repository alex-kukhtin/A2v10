// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Graphics : UIElementBase
	{
		public String Delegate { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var g = new TagBuilder("a2-graphics", null, IsInGrid);
			MergeAttributes(g, context);

			if (!String.IsNullOrEmpty(Delegate))
				g.MergeAttribute(":render", $"$delegate('{Delegate}')");
			else
				throw new XamlException("Graphics. Delegate must be specified");

			Guid guid = Guid.NewGuid();
			String id = $"el{guid.ToString()}";
			g.MergeAttribute("id", id);
			g.RenderStart(context);
			g.RenderEnd(context);
		}
	}
}
