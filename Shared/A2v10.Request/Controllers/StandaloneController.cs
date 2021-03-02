// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Request.Properties;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace A2v10.Request
{
	public class StandaloneController
	{
		public BaseController _baseController = new BaseController();

		public async Task LoadData(HttpRequestBase request, HttpResponseBase response)
		{
			if (request.HttpMethod != "POST")
				return;
			response.ContentType = "application/json";
			try
			{
				String json = null;
				using (var tr = new StreamReader(request.InputStream))
					json = tr.ReadToEnd();
				response.ContentType = MimeTypes.Application.Json;
				await _baseController.ReloadData(null, json, response.Output);
			}
			catch (Exception ex)
			{
				_baseController.WriteExceptionStatus(ex, response);
			}
		}

		public async Task LoadLazyData(HttpRequestBase request, HttpResponseBase response, Int64 userId)
		{
			if (request.HttpMethod != "POST")
				return;
			response.ContentType = "application/json";
			try
			{
				String json = null;
				using (var tr = new StreamReader(request.InputStream))
					json = tr.ReadToEnd();
				response.ContentType = MimeTypes.Application.Json;
				await _baseController.LoadLazyData((prms) => prms.Set("UserId", userId), json, response.Output);
			}
			catch (Exception ex)
			{
				_baseController.WriteExceptionStatus(ex, response);
			}
		}

		public async Task SaveData(HttpRequestBase request, HttpResponseBase response, Int64 userId)
		{
			if (request.HttpMethod != "POST")
				return;
			try
			{
				String json = null;
				using (var tr = new StreamReader(request.InputStream))
					json = tr.ReadToEnd();
				response.ContentType = "application/json";
				var dataToSave = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
				String baseUrl = dataToSave.Get<String>("baseUrl");
				if (baseUrl.StartsWith("/model/dialog/"))
				{
					baseUrl = baseUrl.Replace("/model/dialog/", "/_dialog/");
					dataToSave.Set("baseUrl", baseUrl);
				}
				response.ContentType = MimeTypes.Application.Json;
				await _baseController.SaveDataObj(prms => prms.Set("UserId", userId), dataToSave, response.Output);
			}
			catch (Exception ex)
			{
				_baseController.WriteExceptionStatus(ex, response);
			}
		}


		public async Task<ViewInfo> Dialog(String pathInfo, Int64 userId)
		{
			var requestModel = await RequestModel.CreateFromBaseUrl(_baseController.Host, false, pathInfo);
			var rw = requestModel.CurrentDialog;
			ViewInfo viewInfo = new ViewInfo()
			{
				View = $"{rw.Path}/{rw.GetView(_baseController.Host.Mobile)}",
				PageId = $"el{Guid.NewGuid()}",
				Id = rw.Id
			};

			var modelParams = new ExpandoObject();
			if (userId != 0)
				modelParams.Set("UserId", userId);

			var modelScript = new StringBuilder();
			using (var strWriter = new StringWriter(modelScript))
			{
				//rw.view = BaseController.NO_VIEW; // no view here
				//await _baseController.Render(rw, strWriter, modelParams);
			}

			var ctrlScriptSb = new StringBuilder(_baseController.Localize(Resources.standaloneDialogScript));
			ctrlScriptSb.Replace("$(PageGuid)", viewInfo.PageId);

			var scriptSb = new StringBuilder();
			scriptSb.Append("<script type=\"text/javascript\">")
				.AppendLine(modelScript.ToString())
				.AppendLine(ctrlScriptSb.ToString())
				.AppendLine("</script>");

			viewInfo.Scripts = new ScriptInfo()
			{
				Script = scriptSb.ToString()
			};
			return viewInfo;
		}
	}
}
