using A2v10.Request.Properties;
using System;
using System.IO;

namespace A2v10.Request
{
    public partial class BaseController
    {
        public void Layout(TextWriter writer, String rootUrl)
        {
            String layout = Admin ? Resources.layoutAdmin : Resources.layout;
            String layoutText = layout.Replace("$(RootUrl)", rootUrl);
            writer.Write(layoutText);
        }

        public void ShellScript(Boolean bAdmin, TextWriter writer)
        {
            String shell = bAdmin ? Resources.shellAdmin : Resources.shell;
            String shellText = shell.Replace("$(AppVersion)", _host.AppVersion);
            writer.Write(shellText);
        }
    }
}
