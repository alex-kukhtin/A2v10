using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.Serialization;
using A2v10.Infrastructure;
using System.Activities;

namespace A2v10.Workflow
{
    [DataContract]
    public class Process
    {
        [DataMember]
        public Int64 Id { get; set; }
        [DataMember]
        internal Guid WorkflowId { get; set; }


        internal static Process Create()
        {
            return new Process();
        }

        internal static Process GetProcessFromContext(WorkflowDataContext DataContext)
        {
            var pi = DataContext.GetProperties()["Process"];
            var process = pi.GetValue(DataContext) as Process;
            return process;
        }

        private IDataModel _model;

        IDataModel GetModel()
        {
            if (_model != null)
                return _model;
            // Get IDBContext
            return null;
        }
    }
}
