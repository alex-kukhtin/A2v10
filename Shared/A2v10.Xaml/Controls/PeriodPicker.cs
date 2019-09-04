// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public enum PeriodPickerStyle
	{
		Default,
		Hyperlink
	}

	public enum DisplayMode
	{
		Date,
		Name,
		NameDate
	}

	public class PeriodPicker : ValuedControl, ITableControl
	{

		public TextAlign Align { get; set; }

		public DropDownPlacement Placement { get; set; }
		public PeriodPickerStyle Style { get; set; }
		public ControlSize Size { get; set; }
		public Boolean? ShowAllData { get; set; }
		public DisplayMode Display { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var tag = new TagBuilder("a2-period-picker", null, IsInGrid);
			onRender?.Invoke(tag);
			if (Style != PeriodPickerStyle.Default)
				tag.AddCssClass($"pp-{Style.ToString().ToLowerInvariant()}");
			if (Size != ControlSize.Default)
				tag.AddCssClass($"pp-{Size.ToString().ToLowerInvariant()}");
			if (ShowAllData != null)
				tag.MergeAttribute(":show-all", ShowAllData.ToString().ToLowerInvariant());
			if (Display != DisplayMode.Date)
				tag.MergeAttribute("display", Display.ToString().ToLowerInvariant());
			MergeAttributes(tag, context);
			MergeDisabled(tag, context);
			MergeAlign(tag, context, Align);
			MergeValue(tag, context);
			if (Placement != DropDownPlacement.BottomLeft)
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
