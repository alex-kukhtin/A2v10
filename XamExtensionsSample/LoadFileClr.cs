
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request;
using System.Threading.Tasks;
using System;
using System.IO;

namespace XamExtensionsSample
{

    public class LoadFileClr : IInvokeTarget
    {
        public Object Invoke(Int64 UserId, Int32 TenantId, Int64 Id, String ModelName)
        {
            var bytes = File.ReadAllBytes("c:/temp/sample.pdf");
            return new ServerCommandResult(bytes, "application/pdf")
            {
                FileName = ModelName
            };
        }
    }
}