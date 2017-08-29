
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public abstract class ContentControl : Control
	{
		public Object Content { get; set; }

        internal override void AddAttributes(TagBuilder tag, RenderContext context)
        {
            base.AddAttributes(tag, context);
            var contBind = GetBinding(nameof(Content));
            if (contBind != null)
                tag.MergeAttribute("v-text", contBind.GetPath(context));
        }

        internal void RenderContent(RenderContext context)
        {
            if (Content == null)
                return;
            if (Content is UIElement)
                (Content as UIElement).RenderElement(context);
            else if (Content != null)
                context.Writer.Write(Content.ToString());
        }

		protected override void OnEndInit()
		{
			base.OnEndInit();
			XamlElement xamlElem = Content as XamlElement;
			if (xamlElem != null)
				xamlElem.SetParent(this); 
		}
	}
}
