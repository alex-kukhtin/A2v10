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
        public DataModelTest()
        {
            _dbContext = TestConfig.DbContext.Value;
        }

        [TestMethod]
        public async Task SimpleScript()
        {
            IDataModel dm = await _dbContext.LoadModelAsync("a2test.ArrayModel");
            String script = dm.CreateScript();
            /*TODO: check script */
            Assert.IsTrue(true);
        }
    }
}
