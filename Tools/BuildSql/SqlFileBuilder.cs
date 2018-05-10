using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BuildSql
{
	public class SqlFileBuilder
	{
		String _path;
		public SqlFileBuilder(String path)
		{
			_path = path;
		}

		public void Process()
		{
			String jsonPath = Path.Combine(_path, "sql.json");
			if (!File.Exists(jsonPath)) {
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
			using (var fw = File.Open(outFilePath, FileMode.CreateNew, FileAccess.Write))
			{
				Console.WriteLine($"Writing {item.outputFile}");
				using (var sw = new StreamWriter(fw))
				{
					sw.Write($"{nl}{nl}/* {item.outputFile} */{nl}{nl}");
					foreach (var f in item.inputFiles)
					{
						var inputPath = Path.Combine(_path, f);
						Console.WriteLine($"\t{f}");
						var inputText = File.ReadAllText(inputPath);
						sw.Write(inputText);
					}
				}
			}
		}
	}
}
