
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System.Threading.Tasks;
using System;
using A2v10.Request;
using System.IO;

namespace XamExtensionsSample
{

    public class LoadFileClr : IInvokeTarget
    {
        public Object Invoke(Int64 UserId, Int32 TenantId, Int64 Id)
        {
            var bytes = File.ReadAllBytes("c:/temp/sample.pdf");
            return new ServerCommandResult(bytes, "application/pdf");
        }
    }
}