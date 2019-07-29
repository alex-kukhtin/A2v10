// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Collections.Specialized;
using System.Web;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;
using A2v10.Interop.ExportTo;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public async Task Data(String command, Action<ExpandoObject> setParams /*Int32 tenantId, Int64 userId*/, String json, HttpResponseBase response)
		{
			switch (command.ToLowerInvariant())
			{
				case "save":
					await SaveData(setParams, json, response.Output);
					break;
				case "reload":
					await ReloadData(setParams, json, response.Output);
					break;
				case "dbremove":
					await DbRemove(setParams, json, response.Output);
					break;
				case "expand":
					await ExpandData(setParams, json, response.Output);
					break;
				case "loadlazy":
					await LoadLazyData(setParams, json, response.Output);
					break;
				case "invoke":
					await InvokeData(setParams, json, response);
					break;
				case "exportto":
					ExportData(setParams, json, response);
					break;
				default:
					throw new RequestModelException($"Invalid data action {command}");
			}
		}

		void CheckUserState(ExpandoObject prms)
		{
			if (_userStateManager == null)
				return;
			Int64 userId = prms.Get<Int64>("UserId");
			if (_userStateManager.IsReadOnly(userId))
				throw new RequestModelException("UI:@[Error.DataReadOnly]");
		}
		internal Task SaveData(Action<ExpandoObject> setParams, String json, TextWriter writer)
		{
			ExpandoObject dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
			return SaveDataObj(setParams, dataToSave, writer);
		}

		internal async Task SaveDataObj(Action<ExpandoObject> setParams, ExpandoObject dataToSave, TextWriter writer)
		{
			String baseUrl = dataToSave.Get<String>("baseUrl");
			if (NormalizeBaseUrl != null)
				baseUrl = NormalizeBaseUrl(baseUrl);
			ExpandoObject data = dataToSave.Get<ExpandoObject>("data");
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
			RequestView rw = rm.GetCurrentAction();
			var prms = new ExpandoObject();
			setParams?.Invoke(prms);
			prms.Append(rw.parameters);
			CheckUserState(prms);
			IDataModel model = await _dbContext.SaveModelAsync(rw.CurrentSource, rw.UpdateProcedure, data, prms);
			IModelHandler handler = rw.GetHookHandler();
			if (handler != null)
				await handler.AfterSave(data, model.Root);
			WriteDataModel(model, writer);
		}

		void WriteJsonResult(TextWriter writer, Object data)
		{
			writer.Write(JsonConvert.SerializeObject(data, JsonHelpers.StandardSerializerSettings));
		}

		internal async Task ReloadData(Action<ExpandoObject> setParams, String json, TextWriter writer)
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
				loadPrms.Append(CheckPeriod(qryParams), toPascalCase: true);
			}

			if (NormalizeBaseUrl != null)
				baseUrl = NormalizeBaseUrl(baseUrl);

			if (baseUrl == null)
				throw new RequestModelException("There are not base url for command 'reload'");

			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
			RequestView rw = rm.GetCurrentAction();
			String loadProc = rw.LoadProcedure;
			if (loadProc == null)
				throw new RequestModelException("The data model is empty");
			setParams?.Invoke(loadPrms);
			loadPrms.Set("Id", rw.Id);
			loadPrms.Append(rw.parameters);
			ExpandoObject prms2 = loadPrms;
			if (rw.indirect)
			{
				// for indirect action - @UserId and @Id only
				prms2 = new ExpandoObject();
				setParams?.Invoke(prms2);
				prms2.Set("Id", rw.Id);
			}
			IDataModel model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, prms2);
			if (rw.HasMerge)
			{
				var mergeModel = await _dbContext.LoadModelAsync(rw.MergeSource, rw.MergeLoadProcedure, prms2);
				model.Merge(mergeModel);
			}
			rw = await LoadIndirect(rw, model, loadPrms);
			WriteDataModel(model, writer);
		}

		async Task DbRemove(Action<ExpandoObject> setParams, String json, TextWriter writer)
		{
			ExpandoObject jsonData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
			String baseUrl = jsonData.Get<String>("baseUrl");
			Object id = jsonData.Get<Object>("id");
			String propName = jsonData.Get<String>("prop");
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
			var action = rm.GetCurrentAction();
			if (action == null)
				throw new RequestModelException("There are no current action");
			String deleteProc = action.DeleteProcedure(propName);
			if (deleteProc == null)
				throw new RequestModelException("The data model is empty");
			ExpandoObject execPrms = new ExpandoObject();
			setParams?.Invoke(execPrms);
			execPrms.Set("Id", id);
			execPrms.Append(action.parameters);
			CheckUserState(execPrms);
			await _dbContext.LoadModelAsync(action.CurrentSource, deleteProc, execPrms);
			writer.Write("{\"status\": \"OK\"}"); // JSON!
		}

		public NameValueCollection CheckPeriod(NameValueCollection coll)
		{
			var res = new NameValueCollection();
			foreach (var key in coll.Keys)
			{
				var k = key?.ToString();
				if (k.ToLowerInvariant() == "period")
				{
					// parse period
					var ps = coll[k].Split('-');
					res.Remove("From"); // replace prev value
					res.Remove("To");
					if (ps[0].ToLowerInvariant() == "all")
					{
						// from js! utils.date.minDate/maxDate
						res.Add("From", "19010101");
						res.Add("To", "29991231");
					}
					else
					{
						res.Add("From", ps[0]);
						res.Add("To", ps.Length == 2 ? ps[1] : ps[0]);
					}
				}
				else
				{
					res.Add(k, coll[k]);
				}
			}
			return res;
		}

		void AddParamsFromUrl(ExpandoObject prms, String baseUrl)
		{
			if (baseUrl.Contains("?"))
			{
				// add query params from baseUrl
				var nvc = HttpUtility.ParseQueryString(baseUrl.Split('?')[1]);
				prms.Append(CheckPeriod(nvc), toPascalCase: true);
			}
		}

		async Task ExpandData(Action<ExpandoObject> setParams, String json, TextWriter writer)
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
			AddParamsFromUrl(execPrms, baseUrl);
			setParams?.Invoke(execPrms);
			execPrms.Set("Id", id);
			execPrms.Append(action.parameters);
			IDataModel model = await _dbContext.LoadModelAsync(action.CurrentSource, expandProc, execPrms);
			WriteDataModel(model, writer);
		}

		internal async Task LoadLazyData(Action<ExpandoObject> setParams, String json, TextWriter writer)
		{
			ExpandoObject jsonData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
			String baseUrl = jsonData.Get<String>("baseUrl");
			ExpandoObject execPrms = new ExpandoObject();
			AddParamsFromUrl(execPrms, baseUrl);
			Object id = jsonData.Get<Object>("id");
			String propName = jsonData.Get<String>("prop");
			var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
			var action = rm.GetCurrentAction();
			if (action == null)
				throw new RequestModelException("There are no current action");
			String loadProc = action.LoadLazyProcedure(propName.ToPascalCase());
			if (loadProc == null)
				throw new RequestModelException("The data model is empty");
			setParams?.Invoke(execPrms);
			execPrms.Set("Id", id);
			//execPrms.Append(action.parameters); // not needed

			IDataModel model = await _dbContext.LoadModelAsync(action.CurrentSource, loadProc, execPrms);
			WriteDataModel(model, writer);
		}

		internal void ExportData(Action<ExpandoObject> setParams, String json, HttpResponseBase response)
		{
			ExpandoObject jsonData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
			response.ContentType = "application/octet-binary";
			String format = jsonData.Get<String>("format");
			try
			{
				var h = new Html2Excel();
				using (var s = h.ConvertHtmlToExcel(jsonData.Get<String>("html"))) {
					s.Seek(0, SeekOrigin.Begin);
					s.CopyTo(response.OutputStream);
				}
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex, response);
			}
		}

		void WriteDataModel(IDataModel model, TextWriter writer)
		{
			// Write data to output
			writer.Write(JsonConvert.SerializeObject(model.Root, JsonHelpers.StandardSerializerSettings));
		}
	}
}
