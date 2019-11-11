using A2v10.Infrastructure;
using System;
using System.Data.SqlClient;
using System.IO;

namespace A2v10.Runtime
{
	public class AppConfiguration
	{
		public String AppKey { get; private set; }
		public String AppPath { get; private set; }
		public String HelpUrl { get; private set; }

		public FullUserInfo UserInfo {get; private set;}

		public void Load(String cnnString)
		{
			using (var cnn = new SqlConnection(cnnString))
			{
				cnn.Open();
				using (var cmd = cnn.CreateCommand())
				{
					cmd.CommandText = "a2ui.[Application.Start]";
					cmd.CommandType = System.Data.CommandType.StoredProcedure;
					using (var rdr = cmd.ExecuteReader())
					{
						while (rdr.Read())
						{
							// (0) AppPath, (1) UserId, (2) UserName, (3) PersonName, HelpUrl = (4)
							ParseAppPath(rdr.GetString(0));

							if (rdr.IsDBNull(1))
								throw new AccessViolationException("Access denied!");
							var ui = new FullUserInfo();
							ui.UserId = rdr.GetInt64(1);
							ui.UserName = rdr.GetString(2);
							if (!rdr.IsDBNull(3))
								ui.PersonName = rdr.GetString(3);
							UserInfo = ui;
							if (!rdr.IsDBNull(4))
								HelpUrl = rdr.GetString(4);
						}
					}
				}
			}
		}

		void ParseAppPath(String path)
		{
			const String pfKey = "$(ProgramFilesX86)";
			if (path.Contains(pfKey))
				path = path.Replace(pfKey, Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86));
			AppPath = Path.GetDirectoryName(path);
			if (!Directory.Exists(AppPath))
				throw new InvalidProgramException($"Path not found '{AppPath}'");
			AppKey = Path.GetFileName(path);
		}
	}
}
