// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using A2v10.Request.Properties;

namespace A2v10.Request
{
    public partial class BaseController
    {
        Task RenderAbout(TextWriter writer)
        {
            var aboutHtml = new StringBuilder(Resources.about);
            var aboutScript = new StringBuilder(Resources.aboutScript);
            var pageGuid = $"el{Guid.NewGuid()}"; // starts with letter!
            aboutScript.Replace("$(PageGuid)", pageGuid);

            aboutHtml.Replace("$(PageGuid)", pageGuid);
            aboutHtml.Replace("$(AboutScript)", aboutScript.ToString());

            writer.Write(aboutHtml.ToString());

            return Task.FromResult(0);
        }

        Task RenderChangePassword(TextWriter writer)
        {
            throw new RequestModelException($"Show Change Password dialog");
            //return Task.FromResult(0);
        }
    }
}
