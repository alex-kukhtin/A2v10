// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;
using System.Threading.Tasks;

namespace A2v10.Workflow
{
    public class WorkflowEngine : IWorkflowEngine
    {
        IDbContext _dbContext;
        IApplicationHost _host;

        public WorkflowEngine(IApplicationHost host, IDbContext context)
        {
            _host = host;
            _dbContext = context;
        }

        public async Task<Int64> StartWorkflow(StartWorkflowInfo info)
        {
            return await AppWorkflow.StartWorkflow(_host, _dbContext, info);
        }

        public async Task ResumeWorkflow(ResumeWorkflowInfo info)
        {
            await AppWorkflow.ResumeWorkflow(_host, _dbContext, info);
        }

        public void ProcessPendingWorkflows()
        {           
        }
    }
}
