// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Configuration;

using A2v10.Data;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc;

public class LocalDbConfig :IDataConfiguration
{
	public String ConnectionString(String source)
	{
		if (String.IsNullOrEmpty(source))
			source = "Default";
		var strSet = ConfigurationManager.ConnectionStrings[source] 
			?? throw new ConfigurationErrorsException($"Connection string '{source}' not found");
		return strSet.ConnectionString;
	}
}

public class LocalDbContext
{
	public static IDbContext Create()
	{
		var config = new LocalDbConfig();
		return new SqlDbContext(new NullProfiler(), config,
			new NullLocalizer());
	}
}
