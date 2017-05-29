using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public class ContentControl : Control
	{
		public Object Content { get; set; }

		protected override void OnEndInit()
		{
			base.OnEndInit();
			XamlElement xamlElem = Content as XamlElement;
			if (xamlElem != null)
				xamlElem.SetParent(this); 
		}
	}
}
