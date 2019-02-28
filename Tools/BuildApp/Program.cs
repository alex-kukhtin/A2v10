// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

namespace BuildApp
{
	class Program
	{
		static Int32 Main(String[] args)
		{
			if (args.Length == 0)
			{
				Console.WriteLine("Usage: buildapp [directory]");
				return -1;
			}
			String dir = Path.GetFullPath(args[0].ToLowerInvariant());

			Console.WriteLine($"Processing: {dir}");
			String outFileName = Path.GetFileName(dir);
			String outFilePath = Path.Combine(dir, $"..\\{outFileName}.app");
			String outFile = Path.GetFullPath(outFilePath);
			var zp = new ZipProcessor(dir, outFile);
			zp.Process();
			Console.WriteLine();
			Console.WriteLine($"Generating app file: {zp.FileName}");
			Console.WriteLine($"Files have been added: {zp.Count}");
			Console.WriteLine();
			return 0;
		}
	}
}
