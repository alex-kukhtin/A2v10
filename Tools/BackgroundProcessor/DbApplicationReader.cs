// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace BackgroundProcessor
{

	public class AppStream
	{
		public String Path { get; set; }
		public String Stream { get; set; }
	}

	public class DbApplicationReader : IApplicationReader
	{
		private readonly IDbContext _dbContext;
		private readonly String _source;

		public DbApplicationReader(String appPath)
		{
			_dbContext = ServiceLocator.Current.GetService<IDbContext>();
			if (appPath.StartsWith("db:"))
				_source = appPath.Substring(3);
			else
				throw new InvalidOperationException($"Invalid appPath (appPath)");
		}

		public Boolean IsFileSystem => false;

		public String CombineRelativePath(String path1, String path2)
		{
			throw new NotImplementedException(nameof(CombineRelativePath));
		}

		public Boolean DirectoryExists(String fullPath)
		{
			throw new NotImplementedException(nameof(DirectoryExists));
		}

		public IEnumerable<String> EnumerateFiles(String path, String searchPattern)
		{
			throw new NotImplementedException(nameof(EnumerateFiles));
		}

		public Boolean FileExists(String fullPath)
		{
			return true;
		}

		public IEnumerable<String> FileReadAllLines(String fullPath)
		{
			throw new NotImplementedException(nameof(FileReadAllLines));
		}

		public String FileReadAllText(String fullPath)
		{
			throw new NotImplementedException(nameof(FileReadAllText));
		}

		public Stream FileStream(String path, String fileName)
		{
			throw new NotImplementedException(nameof(FileStream));
		}

		public Stream FileStreamFullPath(String fullPath)
		{
			fullPath = fullPath.Replace('\\', '/').ToLowerInvariant();
			var appStream = _dbContext.Load<AppStream>(_source, "a2sys.LoadApplicationFile", new { Path = fullPath });
			if (appStream == null)
				throw new FileNotFoundException($"file not found: {fullPath}");
			return new MemoryStream(Encoding.UTF8.GetBytes(appStream.Stream));
		}

		public String MakeFullPath(String path, String fileName)
		{
			return Path.Combine(path, fileName);
		}

		public String ReadTextFile(String path, String fileName)
		{
			String fullPath = CheckPath(Path.Combine(path, fileName));
			var appStream = _dbContext.Load<AppStream>(_source, "a2sys.LoadApplicationFile", new { Path = fullPath });
			if (appStream == null)
				throw new FileNotFoundException($"file not found: {fullPath}");
			return appStream.Stream;
		}

		public async Task<String> ReadTextFileAsync(String path, String fileName)
		{
			String fullPath = CheckPath(Path.Combine(path, fileName));
			var appStream = await _dbContext.LoadAsync<AppStream>(_source, "a2sys.LoadApplicationFile", new { Path = fullPath });
			if (appStream == null)
				throw new FileNotFoundException($"file not found: {fullPath}");
			return appStream.Stream;
		}

		private String CheckPath(String path)
		{
			return path.Replace('\\', '/').ToLowerInvariant();
		}
	}
}
