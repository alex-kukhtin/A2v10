
using Microsoft.VisualStudio.TestTools.UnitTesting;
using A2v10.Infrastructure;
using System.Threading.Tasks;
using A2v10.Tests.DataModelTester;
using A2v10.Tests.Config;

namespace A2v10.Tests
{
	[TestClass]
	public class DatabaseTest
	{

		IDbContext _dbContext;
		public DatabaseTest()
		{
			_dbContext = TestConfig.DbContext;
		}

		[TestMethod]
		public async Task TestSimpleModel()
		{
			IDataModel dm = await _dbContext.LoadModelAsync("a2test.SimpleModel");
			var md = new MetadataTester(dm);
			var dt = new DataTester(dm);
		}
	}
}
