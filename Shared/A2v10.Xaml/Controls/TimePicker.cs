// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class TimePicker: ValuedControl, ITableControl
	{
		public TextAlign Align { get; set; }
		public DropDownPlacement Placement { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (CheckDisabledModel(context))
				return;
			var input = new TagBuilder("a2-time-picker", null, IsInGrid);
			onRender?.Invoke(input);
			MergeAttributes(input, context);
			MergeDisabled(input, context);
			MergeAlign(input, context, Align);
			if (Placement != DropDownPlacement.BottomLeft)
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
