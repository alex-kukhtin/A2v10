// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class InlineDialog : Container
	{
		public Length Width { get; set; }
		public Length MinWidth { get; set; }
		public Length Height { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			//TODO: How to show it???
			throw new NotImplementedException();
		}
	}
}
