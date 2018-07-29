// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Text;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{

	public enum ValidatorPlacement
	{
		TopLeft = 0,
		TopRight,
		BottomLeft,
		BottomRight
	}

	public class Validator : XamlElement
	{
		public Length Width { get; set; }
		public ValidatorPlacement? Placement { get; set; }

		internal void MergeAttributes(TagBuilder tag)
		{
			tag.MergeAttribute(":validator-options", ToJsObject());
		}

		String ToJsObject()
		{
			var sb = new StringBuilder("{");
			if (Width != null)
				sb.Append($"width:'{Width.Value}',");
			if (Placement != null)
				sb.Append($"placement: '{Placement.Value.ToString().ToKebabCase()}',");
			sb.RemoveTailComma();
			sb.Append("}");
			return sb.ToString();
		}
	}
}
