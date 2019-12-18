// Copyright © 2018-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace BuildSql
{
	class Program
	{
		static void Main(String[] args)
		{
			var v = Assembly.GetExecutingAssembly().GetName().Version;
			Console.WriteLine($"BuildSQL Version: {v.Major}.{v.Minor}.{v.Build}");
			if (args.Length == 0)
			{
				Console.WriteLine("Usage: buildsql [appdir]");
				return;
			}

			String dir = args[0].ToLowerInvariant();
			Console.WriteLine($"Processing: {dir}");

			try
			{
				SqlFileBuilder fb = new SqlFileBuilder(dir);
				fb.Process();
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Exception: {ex.Message}");
			}
			Console.WriteLine();
		}
	}
}
