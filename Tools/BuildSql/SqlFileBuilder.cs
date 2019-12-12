// Copyright © 2018-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using Newtonsoft.Json;

namespace BuildSql
{
	public class SqlFileBuilder
	{
		readonly String _path;

		public SqlFileBuilder(String path)
		{
			_path = path;
		}

		public void Process()
		{
			String jsonPath = Path.Combine(_path, "sql.json");
			if (!File.Exists(jsonPath))
			{
				Console.WriteLine($"File not found: {jsonPath}");
			}

			String jsonText = File.ReadAllText(jsonPath);
			List<ConfigItem> list = JsonConvert.DeserializeObject<List<ConfigItem>>(jsonText);

			foreach (var item in list)
			{
				ProcessOneItem(item);
			}
		}

		void ProcessOneItem(ConfigItem item)
		{
			String outFilePath = Path.Combine(_path, item.outputFile);
			File.Delete(outFilePath);
			var nl = Environment.NewLine;
			FileStream fw = null;
			try
			{
				fw = File.Open(outFilePath, FileMode.CreateNew, FileAccess.Write);
				Console.WriteLine($"Writing {item.outputFile}");
				using (var sw = new StreamWriter(fw, new UTF8Encoding(true)))
				{
					fw = null;
					WriteVersion(item, sw);
					sw.Write($"{nl}{nl}/* {item.outputFile} */{nl}{nl}");
					foreach (var f in item.inputFiles)
					{
						var inputPath = Path.Combine(_path, f);
						Console.WriteLine($"\t{f}");
						var inputText = File.ReadAllText(inputPath);
						if (item.replaceSessionContext) {
							// TODO:
							inputText = inputText.Replace("default(cast(session_context(N'TenantId') as int))", "default(1)");
						}
						sw.Write(inputText);
						sw.WriteLine();
					}
				}
			}
			finally
			{
				if (fw != null)
					fw.Close();
			}
		}

		void WriteVersion(ConfigItem item, StreamWriter writer)
		{
			if (String.IsNullOrEmpty(item.version))
				return;
			// write version
			var nl = Environment.NewLine;
			Console.WriteLine($"version: {item.version}");
			String msg = $"/*{nl}version: {item.version}{nl}generated: {DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss")}{nl}*/";
			writer.WriteLine(msg);
		}
	}
}
