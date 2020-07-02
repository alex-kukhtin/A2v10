// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using Newtonsoft.Json;

namespace UploadApp
{
	public class AppUploader
	{
		private readonly String _cnnString;
		private readonly String _directory;

		public AppUploader(String cnnString, String directory)
		{
			_cnnString = cnnString;
			_directory = directory;
		}

		public void Run()
		{
			String fileName = Path.Combine(_directory, "uploadapp.json");
			if (!File.Exists(fileName))
			{
				Console.WriteLine($"File 'uploadapp.json' not found in '{_directory}'");
				return;
			}

			var files = JsonConvert.DeserializeObject<AppFiles>(File.ReadAllText(fileName));

			if (files == null || files.files.Count == 0)
				Console.WriteLine($"There are no files to write");

			using (var cnn = new SqlConnection(_cnnString))
			{
				cnn.Open();
				using (var cmd = cnn.CreateCommand())
				{
					cmd.CommandText = "a2sys.[UploadApplicationFile]";
					cmd.CommandType = CommandType.StoredProcedure;
					cmd.Parameters.Add("Path", SqlDbType.NVarChar);
					cmd.Parameters.Add("Stream", SqlDbType.NVarChar).Size = 10485760;

					WriteAllFiles(files.files, cmd);
				}
				cnn.Close();
			}
		}

		void WriteAllFiles(List<String> files, SqlCommand cmd)
		{
			foreach (var f in files)
			{
				var filePrefix = Path.GetDirectoryName(f);
				if (f.Contains("*"))
				{
					var dir = Path.GetDirectoryName(Path.Combine(_directory, f));
					var pattern = Path.GetFileName(f);
					foreach (var file in Directory.EnumerateFiles(dir, pattern))
					{
						var text = File.ReadAllText(file);
						var name = Path.Combine(filePrefix, Path.GetFileName(file));
						WriteOneFile(cmd, text, name);
					}
				}
				else
				{
					var file = Path.Combine(_directory, f);
					var text = File.ReadAllText(file);
					var name = Path.Combine(filePrefix, Path.GetFileName(file));
					WriteOneFile(cmd, text, name);
				}
			}
		}

		void WriteOneFile(SqlCommand cmd, String text, String name)
		{
			name = name.Replace('\\', '/').ToLowerInvariant();
			Console.Write($"Writing {name}...");
			cmd.Parameters[0].Value = name;
			cmd.Parameters[1].Value = text;
			cmd.ExecuteNonQuery();
			Console.WriteLine(" complete");
		}
	}
}
