// Copyright © 2018 Alex Kukhtin. All rights reserved.

namespace A2v10.Xaml.Drawing
{
	public static class Extensions
	{
		internal static void SetPositionAndSize(this IHasPositionAndSize elem, TagBuilder tag)
		{
			if (elem.Size != null)
			{
				tag.MergeAttribute("width", elem.Size.Width.ToString());
				tag.MergeAttribute("height", elem.Size.Height.ToString());
			}
			if (elem.Pos != null)
			{
				tag.MergeAttribute("x", elem.Pos.X.ToString());
				tag.MergeAttribute("y", elem.Pos.Y.ToString());
			}
		}

		internal static void SetMarkers(this IHasMarkers elem, TagBuilder tag)
		{
			if (elem.MarkerStart == LineMarkerStyle.Arrow)
				tag.MergeAttribute("marker-start", "url(#arrow-start)");
			if (elem.MarkerEnd == LineMarkerStyle.Arrow)
				tag.MergeAttribute("marker-end", "url(#arrow-end)");
		}
	}
}
