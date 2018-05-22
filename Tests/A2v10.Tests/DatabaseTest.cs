// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Threading.Tasks;
using System.Dynamic;

using Microsoft.VisualStudio.TestTools.UnitTesting;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using A2v10.Tests.Config;
using A2v10.Data;
using A2v10.Data.Interfaces;
using A2v10.Data.Tests;

namespace A2v10.Tests
{
	[TestClass]
	[TestCategory("Database")]
	public class DatabaseTest
	{

		IDbContext _dbContext;
		readonly IDataScripter _scripter;
		public DatabaseTest()
		{
			TestConfig.Start();
			_dbContext = ServiceLocator.Current.GetService<IDbContext>();
			_scripter = ServiceLocator.Current.GetService<IDataScripter>();
		}



		[TestMethod]
		public async Task TestEmptyArrayMeta()
		{
			IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.EmptyArray");
			var md = new MetadataTester(dm);
			md.IsAllKeys("TRoot,TModel,TRow");
			md.IsItemType("TRoot", "Model", FieldType.Object);
			md.IsId("TModel", "Key");
			md.IsName("TModel", "ModelName");
			md.IsItemRefObject("TModel", "Rows", "TRow", FieldType.Array);

			String script = dm.CreateScript(_scripter);
			var pos = script.IndexOf("cmn.defineObject(TRow, {props: {}}, true);");
			Assert.AreNotEqual(-1, pos, "Invalid script for array");
		}
	}
}