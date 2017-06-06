
using Microsoft.VisualStudio.TestTools.UnitTesting;
using A2v10.Infrastructure;
using System.Threading.Tasks;
using A2v10.Tests.DataModelTester;
using A2v10.Tests.Config;

namespace A2v10.Tests
{
	[TestClass]
	[TestCategory("Database")]
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
			md.HasAllProperties("TProduct", "Id,Name,Unit");
			md.HasAllProperties("TUnit", "Id,Name");

			var docT = new DataTester(dm, "Document");
			docT.AreValueEqual(123, "Id");
			docT.AreValueEqual("DocNo", "No");

			var agentT = new DataTester(dm, "Document.Agent");
			agentT.AreValueEqual(512, "Id");
			agentT.AreValueEqual("Agent 512", "Name");
			agentT.AreValueEqual("Code 512", "Code");

			agentT = new DataTester(dm, "Document.Company");
			agentT.AreValueEqual(512, "Id");
			agentT.AreValueEqual("Agent 512", "Name");
			agentT.AreValueEqual("Code 512", "Code");

			var row1T = new DataTester(dm, "Document.Rows1");
			row1T.IsArray(1);
			row1T.AreArrayValueEqual(78, 0, "Id");
			row1T.AreArrayValueEqual(4.0, 0, "Qty");

			var row2T = new DataTester(dm, "Document.Rows2");
			row2T.IsArray(1);
			row2T.AreArrayValueEqual(79, 0, "Id");
			row2T.AreArrayValueEqual(7.0, 0, "Qty");

			var row1Obj = new DataTester(dm, "Document.Rows1[0]");
			row1Obj.AreValueEqual(78, "Id");
			row1Obj.AreValueEqual(4.0, "Qty");
			row1Obj.AllProperties("Id,Qty,Price,Sum,Product,Series1");

			var prodObj = new DataTester(dm, "Document.Rows1[0].Product");
			prodObj.AreValueEqual(782, "Id");
			prodObj.AreValueEqual("Product 782", "Name");
			prodObj.AllProperties("Id,Name,Unit");
			var unitObj = new DataTester(dm, "Document.Rows1[0].Product.Unit");
			unitObj.AreValueEqual(7, "Id");
			unitObj.AreValueEqual("Unit7", "Name");
			unitObj.AllProperties("Id,Name");

			prodObj = new DataTester(dm, "Document.Rows2[0].Product");
			prodObj.AreValueEqual(785, "Id");
			prodObj.AreValueEqual("Product 785", "Name");
			unitObj = new DataTester(dm, "Document.Rows2[0].Product.Unit");
			unitObj.AreValueEqual(8, "Id");
			unitObj.AreValueEqual("Unit8", "Name");

			var seriesObj = new DataTester(dm, "Document.Rows1[0].Series1");
			seriesObj.IsArray(1);
			seriesObj.AreArrayValueEqual(500, 0, "Id");
			seriesObj.AreArrayValueEqual(5.0, 0, "Price");

			seriesObj = new DataTester(dm, "Document.Rows2[0].Series1");
			seriesObj.IsArray(1);
			seriesObj.AreArrayValueEqual(501, 0, "Id");
			seriesObj.AreArrayValueEqual(10.0, 0, "Price");
		}


		[TestMethod]
		public async Task TestTreeModel()
		{
			IDataModel dm = await _dbContext.LoadModelAsync("a2test.TreeModel");
			var md = new MetadataTester(dm);
			md.IsAllKeys("TRoot,TMenu");
			md.HasAllProperties("TRoot", "Menu");
			md.HasAllProperties("TMenu", "Menu,Name");
			md.IsName("TMenu", "Name");

			var dt = new DataTester(dm, "Menu");
			dt.IsArray(2);
			dt.AreArrayValueEqual("Item 1", 0, "Name");
			dt.AreArrayValueEqual("Item 2", 1, "Name");

			dt = new DataTester(dm, "Menu[0].Menu");
			dt.IsArray(2);
			dt.AreArrayValueEqual("Item 1.1", 0, "Name");
			dt.AreArrayValueEqual("Item 1.2", 1, "Name");

			dt = new DataTester(dm, "Menu[0].Menu[0].Menu");
			dt.IsArray(1);
			dt.AreArrayValueEqual("Item 1.1.1", 0, "Name");
		}
	}
}
