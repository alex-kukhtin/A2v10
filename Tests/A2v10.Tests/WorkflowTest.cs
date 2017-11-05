// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;

using Microsoft.VisualStudio.TestTools.UnitTesting;

using A2v10.Infrastructure;
using A2v10.Tests.Config;
using A2v10.Tests.DataModelTester;
using System.Threading.Tasks;

namespace A2v10.Tests
{

    [TestClass]
    [TestCategory("Workflow")]
    public class WorkflowTest
    {

        static TestConfig _testConfig = new TestConfig();

        public WorkflowTest()
        {
        }

        [TestMethod]
        public async Task StartWorkflowCold()
        {
            await StartWorkflowInt();
        }

        [TestMethod]
        public async Task StartWorkflowHot()
        {
            await StartWorkflowInt();
        }

        async Task StartWorkflowInt()
        { 
            var info = new StartWorkflowInfo() {
                Source = "file:Workflows/SimpleWorkflow_v1",
                UserId = 50, // predefined user id
            };
            var _workflow = ServiceLocator.Current.GetService<IWorkflowEngine>();
            Int64 processId = await _workflow.StartWorkflow(info);
            Assert.AreNotEqual(0, processId);
        }

        [TestMethod]
        public async Task SimpleRequest()
        {
            Int64 modelId = 123; // predefined
            Int64 userId = 50; // predefined
            String bookmark = "Bookmark1";
            var info = new StartWorkflowInfo()
            {
                Source = "file:Workflows/SimpleRequest_v1",
                UserId = userId,
                Schema = "a2test",
                Model = "SimpleModel",
                ActionBase = "simple/model",
                ModelId = modelId
            };
            var _workflow = ServiceLocator.Current.GetService<IWorkflowEngine>();
            Int64 processId = await _workflow.StartWorkflow(info);
            Assert.AreNotEqual(0, processId);

            var dbContext = ServiceLocator.Current.GetService<IDbContext>();
            var pm = await dbContext.LoadModelAsync(String.Empty, "a2workflow.[Process.Load]", 
                new { UserId = userId, Id = processId }
            );

            var dt = new DataTester(pm, "Process");
            dt.AreValueEqual(processId, "Id");
            dt.AreValueEqual("a2test", "Schema");
            dt.AreValueEqual("SimpleModel", "Model");
            dt.AreValueEqual(modelId, "ModelId");
            dt.AreValueEqual(userId, "Owner");
            dt.AreValueEqual("simple/model", "ActionBase");

            dt = new DataTester(pm, "Process.Inboxes");
            dt.IsArray(1);
            dt.AreArrayValueEqual(bookmark, 0, "Bookmark");
            dt.AreArrayValueEqual("User", 0, "For");
            dt.AreArrayValueEqual(userId, 0, "ForId");
            dt.AreArrayValueEqual("inbox/action", 0, "Action");
            Int64 inboxId = dt.GetArrayValue<Int64>(0, "Id");

            dt = new DataTester(pm, "Process.Workflow");
            dt.AreValueEqual("Idle", "ExecutionStatus");

            var rInfo = new ResumeWorkflowInfo()
            {
                Id = inboxId,
                Answer = "OK",
                UserId = userId
            };
            await _workflow.ResumeWorkflow(rInfo);

            pm = await dbContext.LoadModelAsync(String.Empty, "a2workflow.[Process.Load]",
                new { UserId = userId, Id = processId }
            );
            dt = new DataTester(pm, "Process.Workflow");
            dt.AreValueEqual("Closed", "ExecutionStatus");

            pm = await dbContext.LoadModelAsync(String.Empty, "a2workflow.[Inbox.Debug.Load]",
                new { UserId = userId, Id = inboxId }
            );
            dt = new DataTester(pm, "Inbox");
            dt.AreValueEqual(inboxId, "Id");
            dt.AreValueEqual(bookmark, "Bookmark");
            dt.AreValueEqual(userId, "UserRemoved");
            dt.AreValueEqual("OK", "Answer");
            dt.AreValueEqual(true, "Void");
        }
    }
}
