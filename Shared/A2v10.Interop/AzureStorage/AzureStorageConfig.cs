// Copyright © 2020-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Data.Common;

namespace A2v10.Interop.AzureStorage
{
	public class AzureStorageConfig
	{
		const String DEFAULT_CONNECTION_STRING = "AzureStorage";

		public String Protocol { get; private set; }
		public String AccountName { get; private set; }
		public String AccountKey { get; private set; }
		public String EndpointSuffix { get; private set; }


		public AzureStorageConfig(String source)
		{
			Parse(source);
		}

		private void Parse(String source)
		{
			var cnnStrName = source ?? DEFAULT_CONNECTION_STRING;
			var cnnStr = ConfigurationManager.ConnectionStrings[cnnStrName]?.ConnectionString;
			if (cnnStr == null)
				throw new AzureStorageException($"ConnectionString '{cnnStrName}' not found");
			var csb = new DbConnectionStringBuilder()
			{
				ConnectionString = cnnStr
			};
			if (csb.TryGetValue("DefaultEndpointsProtocol", out Object proto))
				Protocol = proto.ToString();
			if (csb.TryGetValue("AccountName", out Object accName))
				AccountName = accName.ToString();
			if (csb.TryGetValue("AccountKey", out Object accKey))
				AccountKey = accKey.ToString();
			if (csb.TryGetValue("EndpointSuffix", out Object endp))
				EndpointSuffix = endp.ToString();
		}

		public String GetUrl(String urlPath)
		{
			return $"{Protocol}://{AccountName}.blob.{EndpointSuffix}/{urlPath}";
		}
	}
}
