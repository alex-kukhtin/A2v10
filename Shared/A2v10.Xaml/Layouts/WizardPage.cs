// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.


using System;

namespace A2v10.Xaml
{
	public class WizardPage : Container
	{
		public String Header { get; set; }
		public String Description { get; set; }
		public Length Height { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var wp = new TagBuilder("a2-wizard-page");
			MergeAttributes(wp, context, MergeAttrMode.SpecialWizardPage);
			MergeBindingAttributeString(wp, context, "header", nameof(Header), Header);
			MergeBindingAttributeString(wp, context, "descr", nameof(Description), Description);
			if (Height != null)
				wp.MergeStyle("height", Height.Value);

			wp.RenderStart(context);
			RenderChildren(context);
			wp.RenderEnd(context);
		}
	}
}
