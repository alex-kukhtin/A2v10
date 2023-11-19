// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Activities.Tracking;
using Microsoft.Activities.Extensions.Tracking;



namespace A2v10.Workflow
{

    public class TrackInfo
    {
        internal TrackingRecord Record;

        public String State { get; set; }
        public long RecordNumber { get { return Record.RecordNumber; } }
        public String Content { get { return Record.ToFormattedString(TrackingOptions.All); } }
        public DateTime EventTime { get { return Record.EventTime; } }
        // System.Diagnostics.TraceLevel
        public Int32 Level { get { return (Int32)Record.Level; } }

        public TrackInfo(TrackingRecord r)
        {
            Record = r;
        }
    }

    internal class WorkflowTracker : TrackingParticipant
    {
        readonly AppWorkflow _workflow;
        public WorkflowTracker(AppWorkflow workflow)
        {
            _workflow = workflow;
        }

        protected override void Track(TrackingRecord record, TimeSpan timeout)
        {
            _workflow.Track(record);
        }
    }
}
