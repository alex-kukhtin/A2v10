﻿
using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public abstract class ContentControl : Control
	{
		public Object Content { get; set; }

        internal override void MergeAttributes(TagBuilder tag, RenderContext context)
        {
            base.MergeAttributes(tag, context);
            var contBind = GetBinding(nameof(Content));
            if (contBind != null)
                tag.MergeAttribute("v-text", contBind.GetPathFormat(context));
        }

        internal void RenderContent(RenderContext context)
        {
            // if it's a binding, it will be added via MergeAttribute
            if (Content == null)
                return;
            if (Content is UIElementBase)
                (Content as UIElementBase).RenderElement(context);
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
