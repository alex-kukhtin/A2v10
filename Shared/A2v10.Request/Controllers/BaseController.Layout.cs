using System;
using System.IO;
using System.Text;
using A2v10.Request.Properties;
using System.Collections.Generic;

namespace A2v10.Request
{
    public partial class BaseController
    {
        public void Layout(TextWriter writer, IDictionary<String, String> prms)
        {
            String layout = Admin ? Resources.layoutAdmin : Resources.layout;
            StringBuilder sb = new StringBuilder(layout);
            foreach (var p in prms)
                sb.Replace(p.Key, p.Value);
            writer.Write(sb.ToString());
        }

        public void ShellScript(Boolean bAdmin, TextWriter writer)
        {
            String shell = bAdmin ? Resources.shellAdmin : Resources.shell;
            StringBuilder sb = new StringBuilder(shell);
            sb.Replace("$(AppVersion)", _host.AppVersion);
            writer.Write(sb.ToString());
        }
    }
}
