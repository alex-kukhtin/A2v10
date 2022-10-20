// Copyright © 2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

namespace A2v10.Infrastructure;

public class ClrApplicationReader : IApplicationReader
{
	private static IAppContainer _container;
	public ClrApplicationReader(String appPath, String key)
	{
		if (_container != null)
			return;
		var (assembly, type) = ClrHelpers.ParseClrType(appPath);
		var ass = Assembly.Load(assembly);
		if (ass == null)
			throw new FileNotFoundException(assembly);
		var inst = ass.CreateInstance(type);
		if (inst == null)
			throw new InvalidOperationException("Invalid type name");
		if (inst is IAppContainer appCont)
			_container = appCont;
		else
			throw new InvalidOperationException("Invalid CLR type");
	}

	public bool IsFileSystem => false;

	public string CombineRelativePath(string path1, string path2)
	{
		return PathHelpers.CombineRelative(path1, path2);
	}

	public Boolean DirectoryExists(String fullPath)
	{
		throw new NotImplementedException();
	}

	public IEnumerable<String> EnumerateFiles(String path, String searchPattern)
	{
		throw new NotImplementedException();
	}

	public bool FileExists(string fullPath)
	{
		throw new NotImplementedException();
	}

	public String FileReadAllText(String fullPath)
	{
		throw new NotImplementedException();
	}

	public Stream FileStreamFullPathRO(String fullPath)
	{
		throw new NotImplementedException();
	}

	public String MakeFullPath(String path, String fileName)
	{
		if (fileName.StartsWith("/"))
		{
			path = String.Empty;
			fileName = fileName.Remove(0, 1);
		}
		// canonicalize
		return GetCanonicalPath(path, fileName);
	}

	public String ReadTextFile(String path, String fileName)
	{
		throw new NotImplementedException();
	}

	public Task<String> ReadTextFileAsync(String path, String fileName)
	{
		return Task.FromResult(ReadTextFile(path, fileName));
	}

	public String GetCanonicalPath(String path, String fileName)
	{
		var sep = new String(Path.DirectorySeparatorChar, 1);
		String rootPath = Path.GetFullPath(sep);
		String fullPath = Path.GetFullPath(Path.Combine(sep, path, fileName)).Substring(rootPath.Length);
		return fullPath.Replace('\\', '/').ToLowerInvariant();
	}
}
