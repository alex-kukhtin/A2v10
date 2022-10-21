// Copyright © 2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;

namespace A2v10.Infrastructure;

public interface IAppContainer
{
	String GetText(String path);
	Stream GetStream(String path);
	Boolean FileExists(String path);
	IEnumerable<String> EnumerateFiles(String path, String searchPattern);
	String Path { get; }
}
