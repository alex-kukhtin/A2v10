// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Wizard : Dialog
	{
		internal override void OnCreateContent(TagBuilder tag)
		{
			tag.AddCssClass("wizard");
		}

		internal override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
		{
			var wiz = new TagBuilder("a2-wizard-panel");
			wiz.RenderStart(context);
			foreach (var p in Children)
			{
				if (!(p is WizardPage))
					throw new XamlException("The child elements of the Wizard can only be WizardPages");
				p.RenderElement(context);
			}
			wiz.RenderEnd(context);
		}
	}
}
