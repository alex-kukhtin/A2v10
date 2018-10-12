// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	public enum DatePickerDropDownPlacement
	{
		BottomLeft,
		BottomRight,
		TopLeft,
		TopRight
	}

	public class DatePicker : ValuedControl, ITableControl
	{

		public TextAlign Align { get; set; }

		public DatePickerDropDownPlacement Placement { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			var input = new TagBuilder("a2-date-picker", null, IsInGrid);
			onRender?.Invoke(input);
			MergeAttributes(input, context);
			MergeDisabled(input, context);
			MergeAlign(input, context, Align);
			if (Placement  != DatePickerDropDownPlacement.BottomLeft)
				input.AddCssClass("drop-" + Placement.ToString().ToKebabCase());
			MergeValue(input, context);
			input.RenderStart(context);
			RenderAddOns(context);
			input.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			if (Align == TextAlign.Default)
				Align = TextAlign.Center;
		}
	}
}
