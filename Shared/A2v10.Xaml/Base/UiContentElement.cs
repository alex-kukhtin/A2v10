// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[ContentProperty("Content")]
	public abstract class UiContentElement : UIElementBase
	{
		public Object Content { get; set; }

		internal virtual void MergeContent(TagBuilder tag, RenderContext context)
		{
			var contBind = GetBinding(nameof(Content));
			if (contBind != null)
				tag.MergeAttribute("v-text", contBind.GetPathFormat(context));
		}

		internal void RenderContent(RenderContext context)
		{
			RenderContent(context, Content);
		}

		internal override void OnDispose()
		{
			base.OnDispose();
			(Content as XamlElement)?.OnDispose();
		}
	}
}
