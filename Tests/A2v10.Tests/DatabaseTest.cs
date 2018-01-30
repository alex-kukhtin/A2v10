// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Threading.Tasks;
using System.Dynamic;

using Microsoft.VisualStudio.TestTools.UnitTesting;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using A2v10.Tests.DataModelTester;
using A2v10.Tests.Config;
using A2v10.Data;

namespace A2v10.Tests
{
    [TestClass]
    [TestCategory("Database")]
    public class DatabaseTest
    {

        IDbContext _dbContext;
        public DatabaseTest()
        {
            TestConfig.Start();
            _dbContext = ServiceLocator.Current.GetService<IDbContext>();
        }

        [TestMethod]
        public async Task LoadSimpleModel()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.[SimpleModel.Load]");
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TModel");
            md.HasAllProperties("TRoot", "Model");
            md.HasAllProperties("TModel", "Name,Id,Decimal");
            md.IsId("TModel", "Id");
            md.IsName("TModel", "Name");

            var dt = new DataTester(dm, "Model");
            dt.AreValueEqual(123, "Id");
            dt.AreValueEqual("ObjectName", "Name");
            dt.AreValueEqual(55.1234M, "Decimal");
        }

        [TestMethod]
        public async Task LoadComplexModel()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.ComplexModel");
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
        public async Task LoadTreeModel()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.TreeModel");
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

        [TestMethod]
        public async Task LoadGroupModel()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.GroupModel");
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TModel");
            md.HasAllProperties("TRoot", "Model");
            md.HasAllProperties("TModel", "Company,Agent,Amount,Items");

            var dt = new DataTester(dm, "Model");
            dt.AreValueEqual(550M, "Amount");
            dt.IsNull("Company");
            dt.IsNull("Agent");

            dt = new DataTester(dm, "Model.Items");
            dt.IsArray(2);
            dt.AreArrayValueEqual("Company 1", 0, "Company");
            dt.AreArrayValueEqual("Company 2", 1, "Company");
            dt.AreArrayValueEqual(500M, 0, "Amount");
            dt.AreArrayValueEqual(50M, 1, "Amount");

            dt = new DataTester(dm, "Model.Items[0].Items");
            dt.IsArray(2);
            dt.AreArrayValueEqual("Company 1", 0, "Company");
            dt.AreArrayValueEqual("Company 1", 1, "Company");
            dt.AreArrayValueEqual("Agent 1", 0, "Agent");
            dt.AreArrayValueEqual("Agent 2", 1, "Agent");
            dt.AreArrayValueEqual(400M, 0, "Amount");
            dt.AreArrayValueEqual(100M, 1, "Amount");

            dt = new DataTester(dm, "Model.Items[1].Items");
            dt.IsArray(2);
            dt.AreArrayValueEqual("Company 2", 0, "Company");
            dt.AreArrayValueEqual("Company 2", 1, "Company");
            dt.AreArrayValueEqual("Agent 1", 0, "Agent");
            dt.AreArrayValueEqual("Agent 2", 1, "Agent");
            dt.AreArrayValueEqual(40M, 0, "Amount");
            dt.AreArrayValueEqual(10M, 1, "Amount");
        }


        [TestMethod]
        public async Task WriteSubObjectData()
        {
            // DATA with ROOT
            var jsonData = @"
            {
			    MainObject: {
				    Id : 45,
				    Name: 'MainObjectName',
				    NumValue : 531.55,
				    BitValue : true,
				    SubObject : {
					    Id: 55,
					    Name: 'SubObjectName',
					    SubArray: [
						    {X: 5, Y:6, D:5.1 },
						    {X: 8, Y:9, D:7.23 }
					    ]
				    }		
			    }
            }
			";
            var dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(jsonData.Replace('\'', '"'), new ExpandoObjectConverter());
            IDataModel dm = await _dbContext.SaveModelAsync(null, "a2test.[NestedObject.Update]", dataToSave);

            var dt = new DataTester(dm, "MainObject");
            dt.AreValueEqual(45L, "Id");
            dt.AreValueEqual("MainObjectName", "Name");

            var tdsub = new DataTester(dm, "MainObject.SubObject");
            tdsub.AreValueEqual(55L, "Id");
            tdsub.AreValueEqual("SubObjectName", "Name");

            var tdsubarray = new DataTester(dm, "MainObject.SubObject.SubArray");
            tdsubarray.IsArray(2);

            tdsubarray.AreArrayValueEqual(5, 0, "X");
            tdsubarray.AreArrayValueEqual(6, 0, "Y");
            tdsubarray.AreArrayValueEqual(5.1M, 0, "D");

            tdsubarray.AreArrayValueEqual(8, 1, "X");
            tdsubarray.AreArrayValueEqual(9, 1, "Y");
            tdsubarray.AreArrayValueEqual(7.23M, 1, "D");
        }

        [TestMethod]
        public async Task WriteNewObject()
        {
            // DATA with ROOT
            var jsonData = @"
            {
			    MainObject: {
				    Id : 0,
				    Name: 'MainObjectName',
			    }
            }
			";
            var dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(jsonData.Replace('\'', '"'), new ExpandoObjectConverter());
            IDataModel dm = await _dbContext.SaveModelAsync(null, "a2test.[NewObject.Update]", dataToSave);

            var dt = new DataTester(dm, "MainObject");
            dt.AreValueEqual("Id is null", "Name");
        }

        [TestMethod]
        public async Task TestComplexObjects()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.ComplexObjects");
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TDocument,TAgent");
            md.IsItemType("TRoot", "Document", FieldType.Object);

            md.IsId("TDocument", "Id");
            md.IsType("TDocument", "Id", DataType.Number);
            md.IsItemType("TDocument", "Agent", FieldType.Object);

            md.IsId("TAgent", "Id");
            md.IsName("TAgent", null);
            md.IsType("TAgent", "Id", DataType.Number);
            md.IsType("TAgent", "Name", DataType.String);
            md.IsItemType("TAgent", "Id", FieldType.Scalar);
            md.IsItemType("TAgent", "Name", FieldType.Scalar);

            var dt = new DataTester(dm, "Document");
            dt.AreValueEqual(200, "Id");

            dt = new DataTester(dm, "Document.Agent");
            dt.AreValueEqual(300, "Id");
            dt.AreValueEqual("Agent name", "Name");
        }

        [TestMethod]
        public async Task TestRefObjects()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.RefObjects");
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TDocument,TAgent");
            md.IsItemType("TRoot", "Document", FieldType.Object);

            md.IsId("TDocument", "Id");
            md.IsItemType("TDocument", "Agent", FieldType.Object);
            md.IsItemType("TDocument", "Company", FieldType.Object);
            md.IsItemRefObject("TDocument", "Agent", "TAgent", FieldType.Object);
            md.IsItemRefObject("TDocument", "Company", "TAgent", FieldType.Object);

            md.IsId("TAgent", "Id");
            md.IsName("TAgent", null);
            md.IsType("TAgent", "Id", DataType.Number);
            md.IsType("TAgent", "Name", DataType.String);
            md.IsItemType("TAgent", "Id", FieldType.Scalar);
            md.IsItemType("TAgent", "Name", FieldType.Scalar);

            var dt = new DataTester(dm, "Document");
            dt.AreValueEqual(200, "Id");

            dt = new DataTester(dm, "Document.Agent");
            dt.AreValueEqual(300, "Id");
            dt.AreValueEqual("Agent Name", "Name");

            dt = new DataTester(dm, "Document.Company");
            dt.AreValueEqual(500, "Id");
            dt.AreValueEqual("Company Name", "Name");
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

            String script = dm.CreateScript();
            var pos = script.IndexOf("cmn.defineObject(TRow, {props: {}}, true);");
            Assert.AreNotEqual(-1, pos, "Invalid script for array");
        }

        [TestMethod]
        public async Task TestDocument()
        {
            ExpandoObject prms = new ExpandoObject();
            prms.Add("UserId", 100);
            Int64 docId = 10;
            prms.Add("Id", docId);
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.[Document.Load]", prms);
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TDocument,TAgent,TRow,TPriceList,TPriceKind,TPrice,TEntity");
            md.HasAllProperties("TRoot", "Document,PriceLists,PriceKinds");
            md.HasAllProperties("TDocument", "Id,Agent,Company,PriceList,PriceKind,Rows");
            md.HasAllProperties("TPriceList", "Id,Name,PriceKinds");
            md.HasAllProperties("TPriceKind", "Id,Name,Prices");
            md.HasAllProperties("TPrice", "Id,Price,PriceKind");
            md.HasAllProperties("TRow", "Id,PriceKind,Entity");
            md.HasAllProperties("TEntity", "Id,Name,Prices");

            md.IsItemType("TDocument", "Rows", FieldType.Array);
            md.IsId("TDocument", "Id");

            md.IsItemType("TRow", "PriceKind", FieldType.Object);
            md.IsItemType("TRow", "Entity", FieldType.Object);
            md.IsId("TRow", "Id");

            md.IsId("TPriceList", "Id");
            md.IsId("TPriceKind", "Id");

            md.IsItemType("TEntity", "Prices", FieldType.Array);

            // data
            var dt = new DataTester(dm, "Document");
            dt.AreValueEqual(docId, "Id");


            dt = new DataTester(dm, "Document.PriceKind.Prices");
            dt.IsArray(2);
            dt.AreArrayValueEqual(22.5M, 0, "Price");
            dt.AreArrayValueEqual(36.8M, 1, "Price");

            dt = new DataTester(dm, "Document.Rows");
            dt.IsArray(1);
            dt.AreArrayValueEqual(59, 0, "Id");

            dt = new DataTester(dm, "Document.Rows[0].PriceKind");
            dt.AreValueEqual(7, "Id");

            dt = new DataTester(dm, "Document.Rows[0].PriceKind.Prices");
            dt.IsArray(2);
            dt.AreArrayValueEqual(22.5M, 0, "Price");
            dt.AreArrayValueEqual(36.8M, 1, "Price");

            dt = new DataTester(dm, "Document.Rows[0].Entity.Prices");
            dt.IsArray(2);
            dt.AreArrayValueEqual(22.5M, 0, "Price");
            dt.AreArrayValueEqual(36.8M, 1, "Price");

            dt = new DataTester(dm, "Document.Rows[0].Entity.Prices[0].PriceKind");
            dt.AreValueEqual(8, "Id");

            dt = new DataTester(dm, "PriceLists");
            dt.IsArray(1);
            dt.AreArrayValueEqual(1, 0, "Id");

            dt = new DataTester(dm, "PriceKinds");
            dt.IsArray(2);
            dt.AreArrayValueEqual(7, 0, "Id");
            dt.AreArrayValueEqual(8, 1, "Id");

        }

        [TestMethod]
        public async Task TestDocument2()
        {
            ExpandoObject prms = new ExpandoObject();
            prms.Add("UserId", 100);
            Int64 docId = 10;
            prms.Add("Id", docId);
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.[Document2.Load]", prms);
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TDocument,TRow,TPriceList,TPriceKind,TPrice,TEntity");
            md.HasAllProperties("TRoot", "Document,PriceLists,PriceKinds");
            md.HasAllProperties("TDocument", "Id,Rows,PriceKind");
            md.HasAllProperties("TPriceList", "Id,Name,PriceKinds");
            md.HasAllProperties("TPriceKind", "Id,Name,Main");
            md.HasAllProperties("TPrice", "Price,PriceKind");
            md.HasAllProperties("TRow", "Id,Entity");
            md.HasAllProperties("TEntity", "Id,Name,Prices");

            md.IsItemType("TDocument", "Rows", FieldType.Array);
            md.IsId("TDocument", "Id");

            md.IsItemType("TRow", "Entity", FieldType.Object);
            md.IsId("TRow", "Id");

            md.IsId("TPriceList", "Id");
            md.IsId("TPriceKind", "Id");

            md.IsItemType("TEntity", "Prices", FieldType.Array);

            // data
            var dt = new DataTester(dm, "Document");
            dt.AreValueEqual(docId, "Id");

            dt = new DataTester(dm, "Document.PriceKind");
            dt.AreValueEqual(4294967306L, "Id");

            dt = new DataTester(dm, "Document.Rows");
            dt.IsArray(1);
            dt.AreArrayValueEqual(59, 0, "Id");

            dt = new DataTester(dm, "Document.Rows[0].Entity.Prices");
            dt.IsArray(3);
            dt.AreArrayValueEqual(185.7M, 0, "Price");
            dt.AreArrayValueEqual(179.4M, 1, "Price");
            dt.AreArrayValueEqual(172.44M, 2, "Price");

            dt = new DataTester(dm, "Document.Rows[0].Entity.Prices[0].PriceKind");
            dt.AreValueEqual(4294967305L, "Id");
            dt.AreValueEqual("Kind 1", "Name");

            dt = new DataTester(dm, "Document.Rows[0].Entity.Prices[1].PriceKind");
            dt.AreValueEqual(4294967304L, "Id");
            dt.AreValueEqual("Kind 2", "Name");

            dt = new DataTester(dm, "Document.Rows[0].Entity.Prices[2].PriceKind");
            dt.AreValueEqual(4294967306L, "Id");
            dt.AreValueEqual("Kind 3", "Name");

            dt = new DataTester(dm, "PriceLists");
            dt.IsArray(2);
            dt.AreArrayValueEqual(4294967300L, 0, "Id");
            dt.AreArrayValueEqual(4294967304L, 1, "Id");

            dt = new DataTester(dm, "PriceKinds");
            dt.IsArray(4);
            dt.AreArrayValueEqual(4294967305L, 0, "Id");
            dt.AreArrayValueEqual(4294967304L, 1, "Id");
            dt.AreArrayValueEqual(4294967306L, 2, "Id");
            dt.AreArrayValueEqual(4294967303L, 3, "Id");

        }

        [TestMethod]
        public async Task Aliases()
        {
            ExpandoObject prms = new ExpandoObject();
            prms.Add("UserId", 100);
            Int64 docId = 10;
            prms.Add("Id", docId);
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.[Document.Aliases]", prms);
            var md = new MetadataTester(dm);
            md.IsAllKeys("TRoot,TDocument,TRow,TEntity");
            md.HasAllProperties("TRoot", "Document");
            md.HasAllProperties("TDocument", "Id,Rows");
            md.HasAllProperties("TRow", "Id,Entity");
            md.HasAllProperties("TEntity", "Id,Name");
            var dt = new DataTester(dm, "Document");
            dt.AreValueEqual(docId, "Id");
            dt = new DataTester(dm, "Document.Rows");
            dt.IsArray(1);
            dt.AreArrayValueEqual(59, 0, "Id");
        }
    }
}