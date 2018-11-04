// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Web;
using System.Text;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using A2v10.Interop;

namespace A2v10.Request
{
	public partial class BaseController
	{
		async Task InvokeData(Action<ExpandoObject> setParams, String json, HttpResponseBase response)
		{
			ExpandoObject dataToInvoke = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
			String baseUrl = dataToInvoke.Get<String>("baseUrl");
			String command = dataToInvoke.Get<String>("cmd");
			ExpandoObject dataToExec = dataToInvoke.Get<ExpandoObject>("data");
			if (dataToExec == null)
				dataToExec = new ExpandoObject();
			setParams?.Invoke(dataToExec);
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
			var cmd = rm.GetCommand(command);
			dataToExec.Append(cmd.parameters);
			await ExecuteCommand(cmd, dataToExec, response);
		}

		async Task ExecuteCommand(RequestCommand cmd, ExpandoObject dataToExec, HttpResponseBase response)
		{
			switch (cmd.type)
			{
				case CommandType.sql:
					await ExecuteSqlCommand(cmd, dataToExec, response.Output);
					break;
				case CommandType.startProcess:
					await StartWorkflow(cmd, dataToExec, response.Output);
					break;
				case CommandType.resumeProcess:
					await ResumeWorkflow(cmd, dataToExec, response.Output);
					break;
				case CommandType.clr:
					await ExecuteClrCommand(cmd, dataToExec, response.Output);
					break;
				case CommandType.xml:
					await ExecuteXmlCommand(cmd, dataToExec, response);
					break;
				case CommandType.script:
					ExecuteScriptCommand(cmd, dataToExec, response.Output); // sync!
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

		async Task ExecuteXmlCommand(RequestCommand cmd, ExpandoObject dataToExec, HttpResponseBase response)
		{
			List<String> xmlSchemaPathes = null;
			if (cmd.xmlSchemas != null)
			{
				xmlSchemaPathes = new List<String>();
				foreach (var schema in cmd.xmlSchemas)
					xmlSchemaPathes.Add(Host.MakeFullPath(false, cmd.Path, schema + ".xsd"));
			}

			if (xmlSchemaPathes == null)
				throw new RequestModelException("The xml-schemes are not specified");

			foreach (var path in xmlSchemaPathes)
			{
				if (!System.IO.File.Exists(path))
					throw new RequestModelException($"File not found '{path}'");
			}

			IDataModel dm = await DbContext.LoadModelAsync(cmd.CurrentSource, cmd.XmlProcedure, dataToExec);

			var xmlCreator = new XmlCreator(xmlSchemaPathes, dm, "UTF-8")
			{
				Validate = cmd.validate
			};
			var bytes = xmlCreator.CreateXml();
			response.ContentType = "text/xml";
			var chars = Encoding.UTF8.GetString(bytes).ToCharArray();
			response.Write(chars, 0, chars.Length);
		}

		void ExecuteScriptCommand(RequestCommand cmd, ExpandoObject dataToExec, TextWriter writer)
		{
			if (String.IsNullOrEmpty(cmd.template))
				throw new RequestModelException($"template must be specified for command '{cmd.command}'");
		}

		async Task ExecuteClrCommand(RequestCommand cmd, ExpandoObject dataToExec, TextWriter writer)
		{
			if (String.IsNullOrEmpty(cmd.clrType))
				throw new RequestModelException($"clrType must be specified for command '{cmd.command}'");
			var invoker = new ClrInvoker();
			Object result;
			if (cmd.async)
				result = await invoker.InvokeAsync(cmd.clrType, dataToExec);
			else
				result = invoker.Invoke(cmd.clrType, dataToExec);
			writer.Write(JsonConvert.SerializeObject(result, StandardSerializerSettings));
		}

		async Task StartWorkflow(RequestCommand cmd, ExpandoObject dataToStart, TextWriter writer)
		{
			if (_workflowEngine == null)
				throw new InvalidOperationException($"Service 'IWorkflowEngine' not registered");
			var swi = new StartWorkflowInfo
			{
				DataSource = cmd.CurrentSource,
				Schema = cmd.CurrentSchema,
				Model = cmd.CurrentModel,
				ModelId = dataToStart.Get<Int64>("Id"),
				ActionBase = cmd.ActionBase
			};
			if (swi.ModelId == 0)
				throw new RequestModelException("Id must be specified to 'startProcess' command");
			if (!String.IsNullOrEmpty(cmd.file))
				swi.Source = $"file:{cmd.file}";
			swi.Comment = dataToStart.Get<String>("Comment");
			swi.UserId = dataToStart.Get<Int64>("UserId");
			if (swi.Source == null)
				throw new RequestModelException($"File or clrType must be specified to 'startProcess' command");
			WorkflowResult wr = await _workflowEngine.StartWorkflow(swi);
			WriteJsonResult(writer, wr);
		}

		async Task ResumeWorkflow(RequestCommand cmd, ExpandoObject dataToStart, TextWriter writer)
		{
			if (_workflowEngine == null)
				throw new InvalidOperationException($"Service 'IWorkflowEngine' not registered");
			var rwi = new ResumeWorkflowInfo
			{
				Id = dataToStart.Get<Int64>("Id")
			};
			if (rwi.Id == 0)
				throw new RequestModelException("InboxId must be specified");
			rwi.UserId = dataToStart.Get<Int64>("UserId");
			rwi.Answer = dataToStart.Get<String>("Answer");
			rwi.Comment = dataToStart.Get<String>("Comment");
			rwi.Params = dataToStart.Get<ExpandoObject>("Params");
			WorkflowResult wr = await _workflowEngine.ResumeWorkflow(rwi);
			WriteJsonResult(writer, wr);
		}

	}
}
