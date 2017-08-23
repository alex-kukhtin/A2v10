using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Workflow
{
    public class Inbox
    {
        public Int64 Id { get; set; }
        public String Bookmark { get; set; }
        public String For { get; set; }
        public Int64 ForId { get; set; }
        public String Text { get; set; }
    }
}
