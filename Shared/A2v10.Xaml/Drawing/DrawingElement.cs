// Copyright © 2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Drawing
{
	public abstract class DrawingElement : XamlElement
	{
		public Boolean? If { get; set; }
		public Boolean? Show { get; set; }
		public Boolean? Hide { get; set; }

		internal abstract void RenderElement(RenderContext context);

		internal void MergeAttributes(TagBuilder tag, RenderContext context)
		{
			MergeBindingAttributeBool(tag, context, "v-if", nameof(If), If);
			MergeBindingAttributeBool(tag, context, "v-show", nameof(Show), Show);
			// emulate v-hide
			MergeBindingAttributeBool(tag, context, "v-show", nameof(Hide), Hide, bInvert: true);
		}
	}
}
