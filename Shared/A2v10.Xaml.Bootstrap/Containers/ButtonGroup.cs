
using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Bootstrap
{
	[ContentProperty("Children")]
	public class ButtonGroup : XamlElement
	{
		public String AriaLabel { get; set; }
		public Boolean Vertical { get; set; }

		public void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var bg = new TagBuilder("div", "btn-group");
			onRender?.Invoke(bg);
			bg.MergeAttribute("role", "group");
			bg.MergeAttribute("aria-label", AriaLabel);
			bg.RenderStart(context);
			bg.RenderEnd(context);
		}
	}
}
