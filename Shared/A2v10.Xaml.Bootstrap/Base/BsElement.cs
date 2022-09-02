// Copyright © 2021-2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml.Bootstrap;

public abstract class BsElement : XamlElement, IXamlElement
{
	public abstract void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);

	public Boolean SkipRender(RenderContext context)
	{
		return false;
	}
}
