using A2v10.Infrastructure;
using System;
using System.Collections.Generic;

namespace A2v10.Workflow
{
    public class MessageInfo
    {
        public Int64 Id { get; set; }
        public String Template { get; set; }
        public String Key { get; set; }

        public IDictionary<String, Object> Params { get; set; }
    }
}
