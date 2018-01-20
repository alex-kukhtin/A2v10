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
            TestConfig.Start();
            _dbContext = ServiceLocator.Current.GetService<IDbContext>();
        }

        [TestMethod]
        public async Task SimpleScript()
        {
            IDataModel dm = await _dbContext.LoadModelAsync(null, "a2test.ArrayModel");
            String script = dm.CreateScript();
            /*TODO: check script */
            Assert.IsTrue(true);
        }
    }
}
