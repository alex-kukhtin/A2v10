// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Bootstrap;

[ContentProperty("Content")]
public abstract class BsContentElement : BsElement
{
	public String Content { get; set; }
}
