// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public abstract class ValuedControl : Control
	{
		public Object Value { get; set; }
		public Object ValidateValue { get; set; }

		internal void MergeValue(TagBuilder input, RenderContext context)
		{
			MergeValueItemProp(input, context, nameof(Value));
			MergeValidateValueItemProp(input, context, nameof(ValidateValue));
		}
	}
}
