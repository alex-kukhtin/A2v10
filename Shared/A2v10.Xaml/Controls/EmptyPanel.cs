
// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class EmptyPanel : ContentControl
	{
		public Icon Icon { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;

			var block = new TagBuilder("div", "empty-panel");
			onRender?.Invoke(block);

			MergeAttributes(block, context);
			block.RenderStart(context);

			RenderIcon(context, Icon);

			var cont = new TagBuilder("div", "empty-panel-content");
			cont.RenderStart(context);
			RenderContent(context);
			cont.RenderEnd(context);

			block.RenderEnd(context);
		}
	}
}
