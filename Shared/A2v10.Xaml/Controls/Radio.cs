// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public enum RadioButtonStyle
	{
		Default,
		CheckBox
	}

	public class Radio : CheckBoxBase
	{
		internal override String ControlType => Style == RadioButtonStyle.CheckBox ? "checkbox" : "radio";
		internal override String InputControlType => "radio";

		public Object CheckedValue { get; set; }

		public RadioButtonStyle Style { get; set; }

		internal override void MergeCheckBoxAttributes(TagBuilder tag, RenderContext context)
		{
			base.MergeCheckBoxAttributes(tag, context);
			var chv = GetBinding(nameof(CheckedValue));
			if (chv != null) {
				tag.MergeAttribute(":value", chv.GetPathFormat(context));
			}
			else if (CheckedValue != null)
				tag.MergeAttribute("value", CheckedValue.ToString());
			else
				throw new XamlException("The CheckedValue attribute is required for Radio");
		}
	}
}
