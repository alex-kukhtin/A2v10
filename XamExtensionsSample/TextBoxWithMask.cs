
using System;
using A2v10.Xaml;

namespace XamExtensionsSample
{
	// see: https://github.com/RobinHerbots/inputmask

	public class TextBoxWithMask : TextBox
	{
		public String Mask { get; set; }

		protected override string TagName => "textbox-with-mask";

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			base.RenderElement(context, (tag) =>
			{
				onRender?.Invoke(tag);
				tag.MergeAttribute("input-mask", Mask);
			});
		}
	}
}
