// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.IO.Compression;

namespace BuildApp
{
	public class AppFilesProcessor
	{
		private readonly String _dirName;

		public String OutFileName => _config.OutputFileName;

		public Int32 Count { get; private set; }

		Config _config;

		public AppFilesProcessor(String dir)
		{
			_dirName = dir;
			Count = 0;
			var configFile = Path.Combine(_dirName, "box.config.json");
			_config = Config.Load(configFile);
		}


		public void Process()
		{
			Prepare();
			if (_config.Compress)
				WriteZipFile();
			else
				CopyFiles();
		}

		void Prepare()
		{
			if (!Directory.Exists(_config.OutputDir))
				Directory.CreateDirectory(_config.OutputDir);
			if (_config.Compress)
			{
				if (File.Exists(_config.OutputFullPath))
					File.Delete(_config.OutputFullPath);
			}
			else
			{
				foreach (var f in Directory.EnumerateFiles(_config.OutputDir))
					File.Delete(f);
				foreach (var d in Directory.EnumerateDirectories(_config.OutputDir))
					Directory.Delete(d, true);
			}
		}

		void WriteZipFile()
		{
			using (var za = ZipFile.Open(_config.OutputFullPath, ZipArchiveMode.Create))
			{
				AddFilesFromDirectory(za, String.Empty);
			}
		}

		void CopyFiles()
		{
			String outDir = _config.OutputDir;
			CopyFilesFromDirectory(outDir, String.Empty);
		}


		void AddFilesFromDirectory(ZipArchive za, String dir)
		{
			String srcDir = Path.Combine(_dirName, dir).ToLowerInvariant();
			foreach (var f in Directory.GetFiles(srcDir))
			{
				String fn = Path.GetFileName(f).ToLowerInvariant();
				if (IsSkipFile(fn, dir))
					continue;
				if (IsSkipBox(f))
					continue;
				String zipPath = Path.Combine(dir, fn).Replace("\\", "/");
				zipPath = zipPath.Replace(".box.", ".");
				za.CreateEntryFromFile(f, zipPath);
				Console.WriteLine(zipPath);
				Count++;
			}
			foreach (var d in Directory.EnumerateDirectories(srcDir))
			{
				String subDir = Path.Combine(dir, Path.GetFileName(d)).Replace("\\", "/").ToLowerInvariant();
				if (_config.IsSkipDir(subDir))
					continue;
				AddFilesFromDirectory(za, subDir);
			}
		}

		void CopyFilesFromDirectory(String outputDir, String dir)
		{
			String srcDir = Path.Combine(_dirName, dir);
			foreach (var f in Directory.EnumerateFiles(srcDir))
			{
				String fn = Path.GetFileName(f).ToLowerInvariant();
				if (IsSkipFile(fn, dir))
					continue;
				if (IsSkipBox(f))
					continue;
				String newPath = Path.Combine(dir, fn).Replace("\\", "/");
				newPath = newPath.Replace(".box.", ".");
				File.Copy(f, Path.Combine(outputDir, newPath));
				Console.WriteLine(newPath);
				Count++;
			}
			foreach (var d in Directory.EnumerateDirectories(srcDir))
			{
				String subDir = Path.Combine(dir, Path.GetFileName(d)).Replace("\\", "/").ToLowerInvariant();
				if (_config.IsSkipDir(subDir))
					continue;
				String outDir = Path.Combine(outputDir, subDir).Replace("\\", "/");
				if (!Directory.Exists(outDir))
					Directory.CreateDirectory(outDir);
				CopyFilesFromDirectory(outputDir, subDir);
			}
		}

		Boolean IsSkipBox(String path)
		{
			// skip file if '*.box.*' is exists
			path = path.ToLowerInvariant();
			if (path.Contains(".box."))
				return false;
			String ext = Path.GetExtension(path);
			String fileName = Path.GetFileNameWithoutExtension(path);
			String dir = Path.GetDirectoryName(path);
			String newFile = $"{Path.Combine(dir, fileName)}.box{ext}";
			return File.Exists(newFile);

		}

		Boolean IsSkipFile(String fileName, String dirName)
		{
			if (_config.IsSkipDir(dirName))
				return true;
			if (_config.IsSkipFile(Path.Combine(dirName, fileName).Replace("\\", "/")))
				return true;
			String ext = Path.GetExtension(fileName).ToLowerInvariant();
			if (_config.IsSkipExtension(ext))
				return true;
			return false;
		}
	}
}
