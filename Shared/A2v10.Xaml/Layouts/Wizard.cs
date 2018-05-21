// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Text;
using A2v10.Infrastructure;

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
			for (var i=0; i<2; i++)
			{
				var p = new TagBuilder("a2-wizard-page");
				p.RenderStart(context);
				context.Writer.Write($"WIZARD PAGE #{i + 1}");
				p.RenderEnd(context);
			}
			/*
			foreach (var p in Children)
			{
				if (!(p is WizardPage))
					throw new XamlException("The child elements of the Wizard can only be WizardPages");
			}
			*/
			wiz.RenderEnd(context);
		}
	}
}
