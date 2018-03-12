using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Tests.Config;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests
{
	[TestClass]
	[TestCategory("DataModel")]
	public class DataModelTest
	{
		IDbContext _dbContext;
		IDataScripter _scripter;
		public DataModelTest()
		{
			TestConfig.Start();
			_dbContext = ServiceLocator.Current.GetService<IDbContext>();
			_scripter = ServiceLocator.Current.GetService<IDataScripter>();
		}

		[TestMethod]
		public async Task SimpleScript()
		{
			IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.ArrayModel");
			String script = dm.CreateScript(_scripter);
			/*TODO: check script */
			Assert.IsTrue(true);
		}
	}
}
