// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

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
                case "loadlazy":
                    await LoadLazyData(userId, json, writer);
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
            var prms = new ExpandoObject();
            prms.Set("UserId", userId);
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
                case CommandType.startProcess:
                    await StartWorkflow(cmd, dataToExec, writer);
                    break;
                case CommandType.resumeProcess:
                    await ResumeWorkflow(cmd, dataToExec, writer);
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

        async Task StartWorkflow(RequestCommand cmd, ExpandoObject dataToStart, TextWriter writer)
        {
            var swi = new StartWorkflowInfo();
            swi.DataSource = cmd.CurrentSource;
            swi.Schema = cmd.CurrentSchema;
            swi.Model = cmd.CurrentModel;
            swi.ModelId = dataToStart.Get<Int64>("Id");
            swi.ActionBase = cmd.ActionBase;
            if (swi.ModelId == 0)
                throw new RequestModelException("ModelId must be specified");
            if (!String.IsNullOrEmpty(cmd.file))
                swi.Source = $"file:{cmd.file}";
            swi.Comment = dataToStart.Get<String>("Comment");
            swi.UserId = dataToStart.Get<Int64>("UserId");
            if (swi.Source == null)
                throw new RequestModelException($"file or clrtype must be specified");
            WorkflowResult wr = await _workflowEngine.StartWorkflow(swi);
            WriteJsonResult(writer, wr);
        }

        async Task ResumeWorkflow(RequestCommand cmd, ExpandoObject dataToStart, TextWriter writer)
        {
            var rwi = new ResumeWorkflowInfo();
            rwi.Id = dataToStart.Get<Int64>("Id");
            if (rwi.Id == 0)
                throw new RequestModelException("InboxId must be specified");
            rwi.UserId = dataToStart.Get<Int64>("UserId");
            rwi.Answer = dataToStart.Get<String>("Answer");
            rwi.Comment = dataToStart.Get<String>("Comment");
            rwi.Params = dataToStart.Get<ExpandoObject>("Params");
            WorkflowResult wr = await _workflowEngine.ResumeWorkflow(rwi);
            WriteJsonResult(writer, wr);
        }

        void WriteJsonResult(TextWriter writer, Object data)
        {
            writer.Write(JsonConvert.SerializeObject(data, StandardSerializerSettings));
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
            ExpandoObject prms2 = loadPrms;
            if (rw.indirect)
            {
                // for indirect action - @UserId and @Id only
                prms2 = new ExpandoObject();
                prms2.Set("UserId", userId);
                prms2.Set("Id", rw.Id);
            }
            IDataModel model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, prms2);
            rw = await LoadIndirect(rw, model, loadPrms);
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

        async Task LoadLazyData(Int64 userId, String json, TextWriter writer)
        {
            ExpandoObject jsonData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
            String baseUrl = jsonData.Get<String>("baseUrl");
            ExpandoObject execPrms = new ExpandoObject();
            if (baseUrl.Contains("?"))
            {
                // add query params from baseUrl
                execPrms.Append(HttpUtility.ParseQueryString(baseUrl.Split('?')[1]), toPascalCase:true);
            }
            Object id = jsonData.Get<Object>("id");
            String propName = jsonData.Get<String>("prop");
            var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
            var action = rm.GetCurrentAction();
            if (action == null)
                throw new RequestModelException("There are no current action");
            String loadProc = action.LoadLazyProcedure(propName.ToPascalCase());
            if (loadProc == null)
                throw new RequestModelException("The data model is empty");
            execPrms.Set("UserId", userId);
            execPrms.Set("Id", id);
            IDataModel model = await _dbContext.LoadModelAsync(action.CurrentSource, loadProc, execPrms);
            WriteDataModel(model, writer);
        }

        void WriteDataModel(IDataModel model, TextWriter writer)
        {
            // Write data to output
            writer.Write(JsonConvert.SerializeObject(model.Root, StandardSerializerSettings));
        }
    }
}
