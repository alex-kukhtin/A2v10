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
        public async Task Data(String command, Int64 userId, String json, TextWriter writer)
        {
            switch (command.ToLowerInvariant())
            {
                case "save":
                    await SaveData(userId, json, writer);
                    break;
                case "reload":
                    await ReloadData(userId, json, writer);
                    break;
                case "dbremove":
                    await DbRemove(userId, json, writer);
                    break;
                case "expand":
                    await ExpandData(userId, json, writer);
                    break;
                case "invoke":
                    await InvokeData(userId, json, writer);
                    break;
                default:
                    throw new RequestModelException($"Invalid data action {command}");
            }
        }

        async Task SaveData(Int64 userId, String json, TextWriter writer)
        {
            ExpandoObject dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            String baseUrl = dataToSave.Get<String>("baseUrl");
            ExpandoObject data = dataToSave.Get<ExpandoObject>("data");
            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            RequestView rw = rm.GetCurrentAction();
            var prms = new
            {
                UserId = userId
            };
            IDataModel model = await _dbContext.SaveModelAsync(rw.CurrentSource, rw.UpdateProcedure, data, prms);
            IModelHandler handler = rw.GetHookHandler(_host);
            if (handler != null)
                await handler.AfterSave(data, model.Root);
            WriteDataModel(model, writer);
        }

        async Task InvokeData(Int64 userId, String json, TextWriter writer)
        {
            ExpandoObject dataToInvoke = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            String baseUrl = dataToInvoke.Get<String>("baseUrl");
            String command = dataToInvoke.Get<String>("cmd");
            ExpandoObject dataToExec = dataToInvoke.Get<ExpandoObject>("data");
            dataToExec.Set("UserId", userId);
            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            var cmd = rm.GetCommand(command);
            await ExecuteCommand(cmd, dataToExec, writer);
        }

        async Task ExecuteCommand(RequestCommand cmd, ExpandoObject dataToExec, TextWriter writer)
        {
            switch (cmd.type)
            {
                case CommandType.sql:
                    await ExecuteSqlCommand(cmd, dataToExec, writer);
                    break;
                default:
                    throw new RequestModelException($"Invalid command type '{cmd.type}'");
            }
        }

        async Task ExecuteSqlCommand(RequestCommand cmd, ExpandoObject dataToExec, TextWriter writer)
        {
            IDataModel model = await _dbContext.LoadModelAsync(cmd.CurrentSource, cmd.CommandProcedure, dataToExec);
            WriteDataModel(model, writer);
        }

        async Task ReloadData(Int64 userId, String json, TextWriter writer)
        {
            ExpandoObject dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
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

        async Task DbRemove(Int64 userId, String json, TextWriter writer)
        {
            ExpandoObject jsonData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            String baseUrl = jsonData.Get<String>("baseUrl");
            Object id = jsonData.Get<Object>("id");
            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            var action = rm.GetCurrentAction();
            if (action == null)
                throw new RequestModelException("There are no current action");
            String deleteProc = action.DeleteProcedure;
            if (deleteProc == null)
                throw new RequestModelException("The data model is empty");
            ExpandoObject execPrms = new ExpandoObject();
            execPrms.Set("UserId", userId);
            execPrms.Set("Id", id);
            await _dbContext.LoadModelAsync(action.CurrentSource, deleteProc, execPrms);
            writer.Write("{\"status\": \"OK\"}"); // JSON!
        }

        async Task ExpandData(Int64 userId, String json, TextWriter writer)
        {
            ExpandoObject jsonData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            String baseUrl = jsonData.Get<String>("baseUrl");
            Object id = jsonData.Get<Object>("id");
            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            var action = rm.GetCurrentAction();
            if (action == null)
                throw new RequestModelException("There are no current action");
            String expandProc = action.ExpandProcedure;
            if (expandProc == null)
                throw new RequestModelException("The data model is empty");
            ExpandoObject execPrms = new ExpandoObject();
            execPrms.Set("UserId", userId);
            execPrms.Set("Id", id);
            IDataModel model = await _dbContext.LoadModelAsync(action.CurrentSource, expandProc, execPrms);
            WriteDataModel(model, writer);
        }

        void WriteDataModel(IDataModel model, TextWriter writer)
        {
            // Write data to output
            writer.Write(JsonConvert.SerializeObject(model.Root, StandardSerializerSettings));
        }
    }
}
