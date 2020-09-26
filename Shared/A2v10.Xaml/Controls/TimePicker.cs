// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class TimePicker: ValuedControl, ITableControl
	{
		public TextAlign Align { get; set; }
		public DropDownPlacement Placement { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			var input = new TagBuilder("a2-time-picker", null, IsInGrid);
			onRender?.Invoke(input);
			MergeAttributes(input, context);
			MergeDisabled(input, context);
			MergeAlign(input, context, Align);
			SetSize(input, nameof(TimePicker));
			if (Placement != DropDownPlacement.BottomLeft)
				input.AddCssClass("drop-" + Placement.ToString().ToKebabCase());
			CheckValueType(context, TypeCheckerTypeCode.Date);
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
