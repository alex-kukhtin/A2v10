// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Workflow
{
    public class WorkflowEngine : IWorkflowEngine
    {
        readonly IDbContext _dbContext;
        readonly IApplicationHost _host;

        public WorkflowEngine(IApplicationHost host, IDbContext context)
        {
            _host = host;
            _dbContext = context;
        }

        public async Task<WorkflowResult> StartWorkflow(StartWorkflowInfo info)
        {
            return await AppWorkflow.StartWorkflow(_host, _dbContext, info);
        }

        public async Task<WorkflowResult> ResumeWorkflow(ResumeWorkflowInfo info)
        {
            return await AppWorkflow.ResumeWorkflow(_host, _dbContext, info);
        }

        public void ProcessPendingWorkflows()
        {           
        }
    }
}
