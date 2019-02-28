// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IApplicationReader
	{
		Boolean IsFileSystem { get; }

		String MakeFullPath(String path, String fileName);
		Task<String> ReadTextFileAsync(String path, String fileName);
		String ReadTextFile(String path, String fileName);
		String CombineRelativePath(String path1, String path2);
		String MakeRelativePath(String path, String fileName);

		IEnumerable<String> EnumerateFiles(String path, String searchPattern);
		Boolean FileExists(String fullPath);
		Boolean DirectoryExists(String fullPath);
		String FileReadAllText(String fullPath);
		IEnumerable<String> FileReadAllLines(String fullPath);

		Stream FileStream(String path, String fileName);
		Stream FileStreamFullPath(String fullPath);
	}
}
