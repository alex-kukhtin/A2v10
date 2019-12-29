
using System;

namespace A2v10.Xaml
{
	public interface ISheetCell
	{
		void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);
		void SetParent(XamlElement parent);
		void OnSetStyles();
	}
}
