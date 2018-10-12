// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public enum UpdateTrigger
	{
		Default,
		Blur,
		Input
	}

	public class TextBox : ValuedControl, ITableControl
	{
		public String Placeholder { get; set; }


		public Int32? Rows { get; set; }

		public Boolean Password { get; set; }
		public Boolean AutoSize { get; set; }
		public Boolean Multiline { get; set; }
		public TextAlign Align { get; set; }
		public UpdateTrigger UpdateTrigger { get; set; }


		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			var tagName = Multiline ? "a2-textarea" : "textbox";
			var input = new TagBuilder(tagName, null, IsInGrid);
			onRender?.Invoke(input);
			MergeAttributes(input, context);
			MergeDisabled(input, context);
			if (Multiline)
				MergeAttributeInt32(input, context, "rows", nameof(Rows), Rows);
			if (Password)
				input.MergeAttribute(":password", "true");
			if (AutoSize)
				input.MergeAttribute(":auto-size", "true");
			if (UpdateTrigger != UpdateTrigger.Default)
				input.MergeAttribute("update-trigger", UpdateTrigger.ToString().ToLowerInvariant());
			MergeAlign(input, context, Align);
			MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
			MergeValue(input, context);
			input.RenderStart(context);
			RenderAddOns(context);
			input.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			if (UpdateTrigger == UpdateTrigger.Input)
			{
				var valBind = GetBinding(nameof(Value));
				if (valBind != null && !String.IsNullOrEmpty(valBind.Mask))
					throw new XamlException("TextBox. UpdateTrigger='Input' is not compatible with the Masked input future");
			}
		}
	}
}
