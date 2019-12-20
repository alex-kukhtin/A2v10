// Copyright © 2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Runtime
{

	public class AppVersionInfo
	{
		[JsonProperty("module")]
		public String Module { get; set; }

		[JsonProperty("version")]
		public Int32 Version { get; set; }

		[JsonProperty("installed")]
		public Int32 Installed { get; set; }
	}

	public class AppVersionsList : List<AppVersionInfo>
	{
		public void SetInstalledVersion(String module, Int32 version)
		{
			var v = this.Find(x => x.Module == module);
			if (v != null)
				v.Installed = version;
		}

		public Boolean IsOk()
		{
			return this.Find(x => x.Version != x.Installed) == null;
		}
	}

	public class AppVersions
	{

		private readonly IApplicationReader _reader;
		private readonly String _cnnString;

		public AppVersions(String dbConnectionString, IApplicationReader reader)
		{
			_reader = reader;
			_cnnString = dbConnectionString;
		}

		public String GetCurrentVersions()
		{
			var verFilePath = _reader.MakeFullPath(String.Empty, "versions.json");
			if (!_reader.FileExists(verFilePath))
				return null;
			String verJson = _reader.FileReadAllText(verFilePath);
			var versions = JsonConvert.DeserializeObject<AppVersionsList>(verJson);

			using (var cnn = new SqlConnection(_cnnString))
			{
				cnn.Open();
				using (var cmd = cnn.CreateCommand())
				{
					cmd.CommandText = "a2sys.[GetVersions]";
					cmd.CommandType = CommandType.StoredProcedure;
					using (var rdr = cmd.ExecuteReader(CommandBehavior.SequentialAccess | CommandBehavior.SingleResult))
					{
						while (rdr.Read())
						{
							String module = rdr.GetString(0);
							Int32 version = rdr.GetInt32(1);
							versions.SetInstalledVersion(module, version);
						}
					}
				}
			}
			return JsonConvert.SerializeObject(versions);
		}
	}
}
