// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.IO.Compression;

namespace BuildApp
{
	public class ZipProcessor
	{
		String _dirName;

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
				if (IsSkipFile(fn))
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

		Boolean IsSkipFile(String fileName)
		{
			if (Path.GetExtension(fileName) == ".sql")
				return true;
			if (fileName == "sql.json")
				return true;
			return false;
		}
	}
}
