// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.IO.Compression;

namespace BuildApp
{
	public class ZipProcessor
	{
		private readonly String _dirName;

		public String FileName { get; }
		public Int32 Count { get; private set; }

		public ZipProcessor(String dir, String outFile)
		{
			_dirName = dir;
			FileName = outFile;
			Count = 0;
		}

		public void Process()
		{
			WriteFile();
		}

		void WriteFile()
		{
			if (File.Exists(FileName))
				File.Delete(FileName);

			using (var za = ZipFile.Open(FileName, ZipArchiveMode.Create))
			{
				AddFilesFromDirectory(za, String.Empty);
			}
		}


		void AddFilesFromDirectory(ZipArchive za, String dir)
		{
			String srcDir = Path.Combine(_dirName, dir);
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
			foreach (var d in Directory.GetDirectories(srcDir))
			{
				String subDir = Path.Combine(dir, Path.GetFileName(d)).Replace("\\", "/").ToLowerInvariant();
				AddFilesFromDirectory(za, subDir);
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
			if (dirName.StartsWith("_platform") || dirName.StartsWith("_api") || dirName.StartsWith("_meta") || dirName.StartsWith("_emails"))
				return true;
			String ext = Path.GetExtension(fileName).ToLowerInvariant();
			if (ext == ".sql")
				return true;
			else if (fileName == "sql.json")
				return true;
			else if (ext == ".pdf")
			{
				if (dirName.StartsWith("fiscal_report/"))
					return true;
			}
			return false;
		}
	}
}
