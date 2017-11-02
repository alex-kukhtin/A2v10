using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
    public struct StartWorkflowInfo
    {
        public Int64 UserId { get; set; }
        public String Source { get; set; }
        public String Schema { get; set; }
        public String Model { get; set; }
        public Int64 ModelId { get; set; }
        public String Comment { get; set; }
    }

    public struct ResumeWorkflowInfo
    {
        public Int64 Id;
        public Int64 UserId;
        public String Answer;
        public String Comment;
    }

    public interface IWorkflowEngine
    {
        Int64 StartWorkflow(StartWorkflowInfo info);

        void ResumeWorkflow(ResumeWorkflowInfo info);

        void ProcessPendingWorkflows();
    }
}
