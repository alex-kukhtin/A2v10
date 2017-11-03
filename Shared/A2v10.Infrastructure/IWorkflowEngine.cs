// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
    public struct StartWorkflowInfo
    {
        public Int64 UserId { get; set; }
        public String Source { get; set; }
        public String DataSource { get; set; }
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
        Task<Int64> StartWorkflow(StartWorkflowInfo info);

        Task ResumeWorkflow(ResumeWorkflowInfo info);

        void ProcessPendingWorkflows();
    }
}
