// Copyright © 2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace A2v10.Infrastructure;

public class ClrApplicationReader : IApplicationReader
{
	private static IAppContainer _container;
	private static String _appPath;
	public ClrApplicationReader(String appPath, String key)
	{
		if (_container != null)
			return;
		var (assembly, type) = ClrHelpers.ParseClrType(key);
		var ass = Assembly.Load(assembly) 
			?? throw new FileNotFoundException(assembly);
		var inst = ass.CreateInstance(type) 
			?? throw new InvalidOperationException("Invalid type name");
		if (inst is IAppContainer appCont)
		{
			_appPath = appPath;
			_container = appCont;
		}
		else
			throw new InvalidOperationException("Invalid CLR type");
	}

	public bool IsFileSystem => false;

	public string CombineRelativePath(string path1, string path2)
	{
		return PathHelpers.CombineRelative(path1, path2);
	}

	public String CombinePath(String path1, String path2, String fileName)
	{
		//return Path.Combine(path1, path2, fileName);
		return fileName;
	}

	public Boolean DirectoryExists(String fullPath)
	{
		return _container.EnumerateFiles(fullPath, "").Any();
	}

	public IEnumerable<String> EnumerateFiles(String path, String searchPattern)
	{
		if (String.IsNullOrEmpty(path))
			return Enumerable.Empty<String>();
		if (searchPattern.StartsWith("*"))
			searchPattern = searchPattern.Substring(1);
		return _container.EnumerateFiles(path, searchPattern);
	}

	public bool FileExists(string fullPath)
	{
		return _container.FileExists(fullPath);
	}

	public String FileReadAllText(String fullPath)
	{
		return _container.GetText(fullPath);
	}

	public Stream FileStreamFullPathRO(String fullPath)
	{
		return _container.GetStream(fullPath);
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
		var fullPath = MakeFullPath(path, fileName);
		return _container.GetText(fullPath);
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
