using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;

namespace A2v10.Request
{
    public partial class BaseController
    {
        public async Task Data(String command, Int64 userId, Stream inputStream, TextWriter writer)
        {
            switch (command.ToLowerInvariant())
            {
                case "save":
                    await SaveData(userId, inputStream, writer);
                    break;
                case "reload":
                    await ReloadData(userId, inputStream, writer);
                    break;
                default:
                    throw new RequestModelException($"Invalid data action {command}");
            }
        }

        async Task SaveData(Int64 userId, Stream inputStream, TextWriter writer)
        {
            ExpandoObject dataToSave;
            using (var tr = new StreamReader(inputStream))
            {
                String json = tr.ReadToEnd();
                dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            }
            String baseUrl = dataToSave.Get<String>("baseUrl");
            ExpandoObject data = dataToSave.Get<ExpandoObject>("data");
            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            RequestView rw = rm.GetCurrentAction();
            var prms = new
            {
                UserId = userId
            };
            IDataModel model = await _dbContext.SaveModelAsync(rw.CurrentSource, rw.UpdateProcedure, data, prms);
            WriteDataModel(model, writer);
        }

        async Task ReloadData(Int64 userId, Stream inputStream, TextWriter writer)
        {
            ExpandoObject dataToSave;
            using (var tr = new StreamReader(inputStream))
            {
                String json = tr.ReadToEnd();
                dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            }
            String baseUrl = dataToSave.Get<String>("baseUrl");

            ExpandoObject loadPrms = new ExpandoObject();
            if (baseUrl.Contains("?"))
            {
                var parts = baseUrl.Split('?');
                baseUrl = parts[0];
                // parts[1] contains query parameters
                var qryParams = HttpUtility.ParseQueryString(parts[1]);
                loadPrms.Append(qryParams, toPascalCase: true);
            }

            if (baseUrl == null)
                throw new RequestModelException("There are not base url for command 'reload'");

            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            RequestView rw = rm.GetCurrentAction();
            String loadProc = rw.LoadProcedure;
            if (loadProc == null)
                throw new RequestModelException("The data model is empty");
            loadPrms.Set("UserId", userId);
            loadPrms.Set("Id", rw.Id);
            IDataModel model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, loadPrms);
            WriteDataModel(model, writer);
        }

        void WriteDataModel(IDataModel model, TextWriter writer)
        {
            // Write data to output
            writer.Write(JsonConvert.SerializeObject(model.Root, StandardSerializerSettings));
        }
    }
}
