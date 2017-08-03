using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Workflow
{
    public class WorkflowException : Exception
    {
        public WorkflowException(String message)
            : base(message)
        {
        }
    }
}
