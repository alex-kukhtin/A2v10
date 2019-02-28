// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Threading.Tasks;

namespace A2v10.Web.Base
{
	public class ZipApplicationReader : IApplicationReader
	{
		private String FileName { get; }

		public Boolean IsFileSystem => false;

		//IDictionary<String, String> _entries = new Dictionary<String, String>(StringComparer.OrdinalIgnoreCase);

		public ZipApplicationReader(String appPath, String appKey)
		{
			String path = Path.Combine(appPath, appKey ?? String.Empty).ToLowerInvariant();
			FileName = Path.ChangeExtension(path, ".app");
			/*
			using (var za = ZipFile.OpenRead(FileName))
			{
				foreach (var ze in za.Entries)
				{
					_entries.Add(ze.FullName.ToLowerInvariant(), ze.FullName);
				}
			}
			*/
		}

		public String MakeFullPath(String path, String fileName)
		{
			if (fileName.StartsWith("/"))
			{
				path = String.Empty;
				fileName = fileName.Remove(0, 1);
			}
			String fullPath = Path.Combine(path, fileName);
			return fullPath.Replace('\\', '/').ToLowerInvariant();
		}

		ZipArchiveEntry GetEntry(ZipArchive archive, String path, String fileName)
		{
			var entry = MakeEntry(path, fileName).ToLowerInvariant();
			return archive.GetEntry(entry);
			/*
			if (_entries.TryGetValue(entry, out String outKey)) {
				return archive.GetEntry(outKey);
			}
			return null;
			*/
		}

		public async Task<String> ReadTextFileAsync(String path, String fileName)
		{
			using (var za = ZipFile.OpenRead(FileName))
			{
				var ze = GetEntry(za, path, fileName);
				if (ze == null)
					return null;
				using (var sr = new StreamReader(ze.Open()))
				{
					return await sr.ReadToEndAsync();
				}
			}
		}

		public String ReadTextFile(String path, String fileName)
		{
			using (var za = ZipFile.OpenRead(FileName))
			{
				var ze = GetEntry(za, path, fileName);
				if (ze == null)
					return null;
				using (var sr = new StreamReader(ze.Open()))
				{
					return sr.ReadToEnd();
				}
			}
		}

		public IEnumerable<String> EnumerateFiles(String path, String searchPattern)
		{
			String searchExtension = searchPattern;
			if (searchExtension.StartsWith("*"))
				searchExtension = searchExtension.Substring(1).ToLowerInvariant();
			using (var za = ZipFile.OpenRead(FileName))
			{
				foreach (var e in za.Entries)
				{
					var ePath = Path.GetDirectoryName(e.FullName);
					var extMatch = e.Name.EndsWith(searchExtension);
					if (ePath == path && extMatch)
						yield return e.FullName;
				}
			}
		}

		public Boolean DirectoryExists(String fullPath)
		{
			if (fullPath == null)
				return false;
			using (var za = ZipFile.OpenRead(FileName))
			{
				foreach (var e in za.Entries)
				{
					var ePath = Path.GetDirectoryName(e.FullName);
					if (ePath == fullPath)
						return true;
				}
			}
			return false;
		}

		public Boolean FileExists(String fullPath)
		{
			if (fullPath == null)
				return false;
			using (var za = ZipFile.OpenRead(FileName))
			{
				var ze = za.GetEntry(fullPath);
				return ze != null;
			}
		}

		public String FileReadAllText(String fullPath)
		{
			if (fullPath == null)
				return null;
			using (var za = ZipFile.OpenRead(FileName))
			{
				var ze = za.GetEntry(fullPath);
				using (var sr = new StreamReader(ze.Open()))
				{
					return sr.ReadToEnd();
				}
			}
		}

		public IEnumerable<String> FileReadAllLines(String fullPath)
		{
			if (fullPath != null)
			{
				using (var za = ZipFile.OpenRead(FileName))
				{
					var ze = za.GetEntry(fullPath);
					using (var sr = new StreamReader(ze.Open()))
					{
						while (!sr.EndOfStream)
						{
							yield return sr.ReadLine();
						}
					}
				}
			}
		}

		public Stream FileStream(String path, String fileName)
		{
			using (var za = ZipFile.OpenRead(FileName))
			{
				var ze = GetEntry(za, path, fileName);
				return Deflate(ze);
			}
		}

		Stream Deflate(ZipArchiveEntry entry)
		{
			if (entry == null)
				return null;
			var ms = new MemoryStream();
			using (var ds = entry.Open())
			{
				ds.CopyTo(ms);
			}
			ms.Seek(0, SeekOrigin.Begin);
			return ms;
		}

		public Stream FileStreamFullPath(String fullPath)
		{
			using (var za = ZipFile.OpenRead(FileName))
			{
				var ze = za.GetEntry(fullPath);
				return Deflate(ze);
			}
		}

		private String MakeEntry(String path, String entry)
		{
			if (String.IsNullOrEmpty(path))
				return entry.ToLowerInvariant();
			return $"{path.Replace('\\', '/')}/{entry}".ToLowerInvariant();
		}


		public String CombineRelativePath(String path1, String path2)
		{
			return PathHelpers.CombineRelative(path1, path2);
		}

		public String MakeRelativePath(String path, String fileName)
		{
			throw new NotImplementedException();
		}
	}
}
