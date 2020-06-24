// Copyright © 2018-2019 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Reflection;

namespace UploadApp
{
	class Program
	{
		static void Main(String[] args)
		{
			var v = Assembly.GetExecutingAssembly().GetName().Version;
			Console.WriteLine($"UploadApp Version: {v.Major}.{v.Minor}.{v.Build}");
			if (args.Length < 2)
			{
				Console.WriteLine("Usage: uploadapp [appdir] [ConnectionString]");
				return;
			}
			String dir = args[0].ToLowerInvariant();
			String cnnString = args[1];

			try
			{
				var uploader = new AppUploader(cnnString, Path.GetFullPath(dir));
				uploader.Run();
			} catch (Exception ex)
			{
				Console.WriteLine(ex.ToString());
			}
			
		}
	}
}
