// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
    public struct StartWorkflowInfo
    {
        public Int64 UserId { get; set; }
        public String ActionBase { get; set; }
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
        public ExpandoObject Params;
    }

    public class WorkflowResult
    {
        public Int64 ProcessId;
        public List<Int64> InboxIds;
    }

    public interface IWorkflowEngine
    {
        Task<WorkflowResult> StartWorkflow(StartWorkflowInfo info);

        Task<WorkflowResult> ResumeWorkflow(ResumeWorkflowInfo info);

        void ProcessPendingWorkflows();
    }
}
