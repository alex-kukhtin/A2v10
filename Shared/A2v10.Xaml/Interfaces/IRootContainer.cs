
// Copyright © 2021-2022 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public interface IRootContainer
{
	void SetStyles(Styles styles);
	XamlElement FindComponent(String name);
}
