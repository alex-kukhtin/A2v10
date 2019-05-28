// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public class FileApplicationReader : IApplicationReader
	{
		private String AppPath { get;}
		private String AppKey { get; }

		public Boolean IsFileSystem => true;


		public FileApplicationReader(String appPath, String appKey)
		{
			AppPath = appPath;
			AppKey = appKey;
		}

		public async Task<String> ReadTextFileAsync(String path, String fileName)
		{
			String fullPath = GetFullPath(path, fileName);
			if (!File.Exists(fullPath))
				return null;
			using (var tr = new StreamReader(fullPath))
			{
				return await tr.ReadToEndAsync();
			}
		}

		public String ReadTextFile(String path, String fileName)
		{
			String fullPath = GetFullPath(path, fileName);
			if (!File.Exists(fullPath))
				return null;
			using (var tr = new StreamReader(fullPath))
			{
				return tr.ReadToEnd();
			}
		}

		public IEnumerable<String> EnumerateFiles(String path, String searchPattern)
		{
			var fullPath = GetFullPath(path, String.Empty);
			if (!Directory.Exists(fullPath))
				return null;
			return Directory.EnumerateFiles(fullPath, searchPattern);
		}

		public Boolean FileExists(String fullPath)
		{
			return File.Exists(fullPath);
		}

		public Boolean DirectoryExists(String fullPath)
		{
			return Directory.Exists(fullPath);
		}


		public String FileReadAllText(String fullPath)
		{
			return File.ReadAllText(fullPath);
		}

		public IEnumerable<String> FileReadAllLines(String fullPath)
		{
			return File.ReadAllLines(fullPath);
		}

		public Stream FileStream(String path, String fileName)
		{
			String fullPath = GetFullPath(path, fileName);
			if (FileExists(fullPath))
				return new FileStream(fullPath, FileMode.Open);
			return null;
		}

		public Stream FileStreamFullPath(String fullPath)
		{
			return new FileStream(fullPath, FileMode.Open);
		}

		public String MakeFullPath(String path, String fileName)
		{
			return GetFullPath(path, fileName);
		}

		String GetFullPath(String path, String fileName)
		{
			String appKey = AppKey;
			if (fileName.StartsWith("/"))
			{
				path = String.Empty;
				fileName = fileName.Remove(0, 1);
			}
			if (appKey != null)
				appKey = "/" + appKey;
			String fullPath = Path.Combine($"{AppPath}{appKey}", path, fileName);
			return Path.GetFullPath(fullPath);
		}

		public String CombineRelativePath(String path1, String path2)
		{
			return Path.GetFullPath(Path.Combine(path1, path2));
		}
	}
}
