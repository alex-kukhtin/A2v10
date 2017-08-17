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
    [TestCategory("Workflow")]
    public class WorkflowTest
    {
        IDbContext _dbContext;
        IWorkflowEngine _workflow;
        public WorkflowTest()
        {
            _dbContext = TestConfig.DbContext.Value;
            _workflow = TestConfig.WorkflowEngine.Value;
        }

        [TestMethod]
        public void StartWorkflowCold()
        {
            StartWorkflowInt();
        }

        [TestMethod]
        public void StartWorkflowHot()
        {
            StartWorkflowInt();
        }

        void StartWorkflowInt()
        { 
            var info = new StartWorkflowInfo() {
                Source = "file:Workflows/SimpleWorkflow_v1",
                UserId = 50, // predefined user id
            };
            Int64 processId = _workflow.StartWorkflow(info);
            Assert.AreNotEqual(0, processId);
        }
    }
}
