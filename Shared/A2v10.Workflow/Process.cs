using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.Serialization;

namespace A2v10.Workflow
{
    [DataContract]
    public class Process
    {
        [DataMember]
        public Int64 Id { get; set; }
    }
}
