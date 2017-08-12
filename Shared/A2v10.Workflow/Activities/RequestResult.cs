using System;
using System.Runtime.Serialization;

namespace A2v10.Workflow
{
    [DataContract]
    public class RequestResult
    {
        [DataMember]
        public Int64 UserId { get; set; }

        [DataMember]
        public String Answer { get; set; }

        [DataMember]
        public String Comment { get; set; }
    }
}
