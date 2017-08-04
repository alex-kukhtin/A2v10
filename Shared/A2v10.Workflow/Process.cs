using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Runtime.Serialization;
using A2v10.Infrastructure;

namespace A2v10.Workflow
{
    [DataContract]
    public class Process
    {
        [DataMember]
        public Int64 Id { get; set; }


        IDataModel _model;

        IDataModel GetModel()
        {
            if (_model != null)
                return _model;
            // Get IDBContext
            return null;
        }
    }
}
