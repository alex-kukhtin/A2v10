
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
			md.IsAllKeys("TRoot,TModel");
			md.HasAllProperties("TRoot", "Model");
			md.HasAllProperties("TModel", "Name,Id");
			md.IsId("TModel", "Id");
			md.IsName("TModel", "Name");

			var dt = new DataTester(dm, "Model");
			dt.AreValueEqual(123, "Id");
			dt.AreValueEqual("ObjectName", "Name");
		}

		[TestMethod]
		public async Task TestComplexModel()
		{
			IDataModel dm = await _dbContext.LoadModelAsync("a2test.ComplexModel");
			var md = new MetadataTester(dm);
			md.IsAllKeys("TRoot,TDocument,TRow,TAgent,TProduct,TSeries,TUnit");
			md.HasAllProperties("TRoot", "Document");
			md.HasAllProperties("TDocument", "Id,No,Date,Agent,Company,Rows1,Rows2");
			md.HasAllProperties("TRow", "Id,Product,Qty,Price,Sum,Series1");
			md.HasAllProperties("TProduct", "Id,Name");

			var docT = new DataTester(dm, "Document");
			docT.AreValueEqual(123, "Id");
			docT.AreValueEqual("DocNo", "No");

			var row1T = new DataTester(dm, "Document.Rows1");
			row1T.IsArray(1);
			row1T.AreArrayValueEqual(78, 0, "Id");
			row1T.AreArrayValueEqual(4.0, 0, "Qty");

			var row2T = new DataTester(dm, "Document.Rows2");
			row2T.IsArray(1);
			row2T.AreArrayValueEqual(79, 0, "Id");
			row2T.AreArrayValueEqual(7.0, 0, "Qty");
		}
	}
}
