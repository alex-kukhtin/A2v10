using System;

namespace A2v10.Workflow
{
    public class TrackRecord
    {
        public DateTime EventTime { get; private set; } = DateTime.Now;
        public String Message { get; set; }
        public Int64 ProcessId { get; set; }
    }
}
