// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public class PeriodPicker : ValuedControl, ITableControl
	{

		public TextAlign Align { get; set; }

		public DatePickerDropDownDirection Direction { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("a2-period-picker", null, IsInGrid);
			if (onRender != null)
				onRender(tag);
			MergeAttributes(tag, context);
			MergeDisabled(tag, context);
			MergeAlign(tag, context, Align);
			MergeValue(tag, context);
			if (Direction != DatePickerDropDownDirection.Down)
				tag.AddCssClass("drop-" + Direction.ToString().ToLowerInvariant());
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
