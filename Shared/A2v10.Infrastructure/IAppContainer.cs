// Copyright © 2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Infrastructure;

public interface IAppContainer
{
	String GetText(String path);
	IEnumerable<String> EnumerateFiles(String path, String searchPattern);
	String Path { get; }
}
