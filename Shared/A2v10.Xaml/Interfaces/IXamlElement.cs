// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
	public interface IXamlElement
	{
		void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);
	}
}
