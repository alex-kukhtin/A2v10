// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using Newtonsoft.Json;

namespace BuildApp
{
	public class Config
	{
		[JsonIgnore]
		readonly HashSet<String> _skipExtension = new HashSet<String>();
		[JsonIgnore]
		readonly HashSet<String> _skipDirectories = new HashSet<String>();
		[JsonIgnore]
		readonly HashSet<String> _skipFiles = new HashSet<String>();

		[JsonProperty("outputDir")]
		public String OutputDir { get; set; }

		[JsonProperty("compress")]
		public Boolean Compress { get; set; }

		[JsonProperty("excludeFiles")]
		public List<String> ExcludeFiles { get; set; }

		[JsonProperty("outputFileName")]
		public String OutputFileName {get; set;}

		[JsonIgnore]
		public String OutputFullPath => Compress ? Path.Combine(OutputDir, OutputFileName).Replace("/", "\\") : null;

		void Create()
		{
			foreach (var s in ExcludeFiles)
			{
				if (s.StartsWith("*."))
					_skipExtension.Add(s.Substring(1).ToLowerInvariant()); // without star
				else if (s.EndsWith("/*"))
					_skipDirectories.Add(s.Substring(0, s.Length - 2).ToLowerInvariant()); // without star and slash
				else
					_skipFiles.Add(s.ToLowerInvariant());
			}
		}

		public static Config Load(String fileName)
		{
			String json = File.ReadAllText(fileName);
			var config = JsonConvert.DeserializeObject<Config>(json);
			config.Create();
			return config;
		}

		public Boolean IsSkipExtension(String ext)
		{
			return _skipExtension.Contains(ext);
		}

		public Boolean IsSkipFile(String fileName)
		{
			return _skipFiles.Contains(fileName);
		}

		public Boolean IsSkipDir(String dirName)
		{
			return _skipDirectories.Contains(dirName);
		}
	}
}
