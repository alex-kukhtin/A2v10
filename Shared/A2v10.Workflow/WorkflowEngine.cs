
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

        public Int64 StartWorkflow(StartWorkflowInfo info)
        {
            return AppWorkflow.StartWorkflow(_host, _dbContext, info);
        }

        public void ResumeWorkflow(ResumeWorkflowInfo info)
        {
            AppWorkflow.ResumeWorkflow(_host, _dbContext, info);
        }

        public void ProcessPendingWorkflows()
        {           
        }
    }
}
