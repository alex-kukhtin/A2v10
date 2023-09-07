using A2v10.Infrastructure;
using A2v10.Request;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace A2v10.Web.Site.TestClr
{
    public class TestFileHandler : IInvokeTarget
    {
        public ServerCommandResult Invoke(Int64 UserId)
        {
            var sc = new ServerCommandResult();
            sc.FileName = "FILE NAME FROM HANDLER";
            sc.Stream = File.ReadAllBytes("c:/temp/so_test.pdf");
            sc.ContentType = "application/pdf";
            return sc;
        }
    }
}