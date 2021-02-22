// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public abstract class ValuedControl : Control
	{
		public Object Value { get; set; }
		public Object ValidateValue { get; set; }

		protected void MergeValue(TagBuilder input, RenderContext context)
		{
			MergeValueItemProp(input, context, nameof(Value));
			MergeValidateValueItemProp(input, context, nameof(ValidateValue));
		}

		internal void CheckValueType(RenderContext context, TypeCheckerTypeCode typeCode)
		{
			var valBind = GetBinding(nameof(Value));
			if (valBind != null)
				valBind.GetTypedPath(context, typeCode);
		}
	}
}
