using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Dynamic;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Request.Properties;
using A2v10.Infrastructure;

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

        public async Task ShellScript(Int64 userId, Boolean bAdmin, TextWriter writer)
        {
            String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

            ExpandoObject loadPrms = new ExpandoObject();
            loadPrms.Set("UserId", userId);

            String schema = bAdmin ? "a2admin" : "a2ui";
            IDataModel dm = await _dbContext.LoadModelAsync(String.Empty, $"[{schema}].[Menu.Load]", loadPrms);

            String jsonMenu = JsonConvert.SerializeObject(dm.Root.RemoveEmptyArrays(), BaseController.StandardSerializerSettings);

            StringBuilder sb = new StringBuilder(shell);
            sb.Replace("$(Menu)", jsonMenu);
            sb.Replace("$(AppVersion)", _host.AppVersion);
            writer.Write(sb.ToString());
        }
    }
}
