// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Collections.Generic;

namespace A2v10.Xaml
{
	public class WizardPage : Container
	{
		public String Header { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var wp = new TagBuilder("a2-wizard-page");
			MergeAttributes(wp, context, MergeAttrMode.SpecialWizardPage);
			var headerBind = GetBinding(nameof(Header));
			if (headerBind != null)
				wp.MergeAttribute(":header", headerBind.GetPathFormat(context));
			else if (Header is String)
				wp.MergeAttribute("header", context.Localize(Header?.ToString()));
			wp.RenderStart(context);
			RenderChildren(context);
			wp.RenderEnd(context);
		}
	}
}
