// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class Wizard : Dialog
	{
		public Command FinishCommand { get; set; }

		internal override void OnCreateContent(TagBuilder tag)
		{
			tag.AddCssClass("wizard");
		}

		internal override void RenderChildren(RenderContext context, Action<TagBuilder> onRenderStatic = null)
		{
			var wiz = new TagBuilder("a2-wizard-panel");
			MergeCommand(wiz, context);
			MergeHelp(wiz, context);
			if (Height != null)
				wiz.MergeAttribute("min-height", Height.Value);
			wiz.RenderStart(context);
			foreach (var p in Children)
			{
				if (!(p is WizardPage))
					throw new XamlException("The child elements of the Wizard can only be WizardPages");
				p.RenderElement(context);
			}
			wiz.RenderEnd(context);
		}

		void MergeCommand(TagBuilder tag, RenderContext context)
		{
			var cmd = GetBindingCommand(nameof(FinishCommand));
			if (cmd == null)
				return;
			tag.MergeAttribute(":finish", $"() => {cmd.GetCommand(context)}");
		}

		void MergeHelp(TagBuilder tag, RenderContext context)
		{
			if (!HasHelp) return;
			var hbind = GetBinding(nameof(HelpUrl));
			String hPath = null;
			if (hbind != null)
			{
				hPath = hbind.GetPathFormat(context);
			}
			else if (!String.IsNullOrEmpty(HelpUrl))
			{
				hPath = $"'{HelpUrl}'";
			}
			tag.MergeAttribute(":help-link", $"$helpHref({hPath})");
		}

		protected override void RenderHelp(RenderContext context)
		{
			// on header
			base.RenderHelp(context);
		}

		protected override void RenderFooter(RenderContext context)
		{
			// do nothing
		}
	}
}
