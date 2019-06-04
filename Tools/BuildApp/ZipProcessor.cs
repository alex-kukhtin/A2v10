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
				String zipPath = Path.Combine(dir, fn).Replace("\\", "/");
				za.CreateEntryFromFile(f, zipPath);
				Console.WriteLine(zipPath);
				Count++;
			}
			foreach (var d in Directory.GetDirectories(srcDir))
			{
				String subDir = Path.Combine(dir, Path.GetFileName(d)).Replace("\\", "/");
				AddFilesFromDirectory(za, subDir);
			}
		}

		Boolean IsSkipFile(String fileName, String dirName)
		{
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
