// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

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

        public async Task ShellScript(Int32 tenantId, Int64 userId, Boolean userAdmin, Boolean bAdmin, TextWriter writer)
        {
            String shell = bAdmin ? Resources.shellAdmin : Resources.shell;

            ExpandoObject loadPrms = new ExpandoObject();
            loadPrms.Set("UserId", userId);
            loadPrms.Set("TenantId", tenantId);

            String proc = bAdmin ? "a2admin.[Menu.Admin.Load]" : "a2ui.[Menu.User.Load]";
            IDataModel dm = await _dbContext.LoadModelAsync(String.Empty, proc, loadPrms);

            String jsonMenu = JsonConvert.SerializeObject(dm.Root.RemoveEmptyArrays(), BaseController.StandardSerializerSettings);

            StringBuilder sb = new StringBuilder(shell);
            sb.Replace("$(Menu)", jsonMenu);
            sb.Replace("$(AppVersion)", _host.AppVersion);
            sb.Replace("$(Admin)", userAdmin ? "true" : "false");
            writer.Write(sb.ToString());
        }

    }
}
