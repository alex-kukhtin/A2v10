// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public enum WatchMode
	{
		None,
		Watch,
		Deep
	}

	public class Graphics : UIElementBase
	{
		public String Delegate { get; set; }
		public Object Argument { get; set; }
		public WatchMode Watch { get; set; }
		public Boolean CenterContent { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			var g = new TagBuilder("a2-graphics", null, IsInGrid);
			MergeAttributes(g, context);
			if (CenterContent)
				g.AddCssClass("center-content");

			if (!String.IsNullOrEmpty(Delegate))
				g.MergeAttribute(":render", $"$delegate('{Delegate}')");
			else
				throw new XamlException("Graphics. Delegate must be specified");
			g.MergeAttribute("watchmode", Watch.ToString().ToLowerInvariant());
			/*
			Guid guid = Guid.NewGuid();
			String id = $"el{guid.ToString()}";
			g.MergeAttribute("id", id);
			*/

			var arg = GetBinding(nameof(Argument));
			if (arg != null)
				g.MergeAttribute(":arg", arg.GetPathFormat(context));
			else if (Argument != null)
				g.MergeAttribute("arg", Argument.ToString());

			g.RenderStart(context);
			g.RenderEnd(context);
		}
	}
}
