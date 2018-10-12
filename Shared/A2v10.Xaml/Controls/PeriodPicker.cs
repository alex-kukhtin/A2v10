// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class PeriodPicker : ValuedControl, ITableControl
	{

		public TextAlign Align { get; set; }

		public DatePickerDropDownPlacement Placement { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-period-picker", null, IsInGrid);
			onRender?.Invoke(tag);
			MergeAttributes(tag, context);
			MergeDisabled(tag, context);
			MergeAlign(tag, context, Align);
			MergeValue(tag, context);
			if (Placement != DatePickerDropDownPlacement.BottomLeft)
				tag.AddCssClass("drop-" + Placement.ToString().ToKebabCase());
			tag.RenderStart(context);
			RenderAddOns(context);
			tag.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			if (Align == TextAlign.Default)
				Align = TextAlign.Center;
		}
	}
}
