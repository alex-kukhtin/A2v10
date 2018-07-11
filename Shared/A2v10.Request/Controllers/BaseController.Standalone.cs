// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Dynamic;
using System.IO;
using System.Threading.Tasks;
using System.Web;

namespace A2v10.Request
{
	public partial class BaseController
	{
		public async Task StandaloneLoadModel(HttpResponseBase response, String pathInfo)
		{
			try
			{
				response.ContentType = "text/javascript";
				await RenderModel(pathInfo, null, response.Output);
			}
			catch (Exception ex)
			{
				WriteScriptException(ex, response.Output);
			}
		}

		public async Task StandaloneLoadData(HttpRequestBase request, HttpResponseBase response, String pathInfo)
		{
			if (request.HttpMethod != "POST")
				return;
			response.ContentType = "application/json";
			try
			{

				String json = null;
				using (var tr = new StreamReader(request.InputStream))
				{
					json = tr.ReadToEnd();
				}

				ExpandoObject requestData = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
				String baseUrl = requestData.Get<String>("url");
				Object id = requestData.Get<Object>("id");

				ExpandoObject loadPrms = new ExpandoObject();
				if (baseUrl.Contains("?"))
				{
					var parts = baseUrl.Split('?');
					baseUrl = parts[0];
					// parts[1] contains query parameters
					var qryParams = HttpUtility.ParseQueryString(parts[1]);
					loadPrms.Append(CheckPeriod(qryParams), toPascalCase: true);
				}

				if (baseUrl == null)
					throw new RequestModelException("There are not base url for command 'reload'");
				baseUrl = $"/_page{baseUrl}/{id}";
				var rm = await RequestModel.CreateFromBaseUrl(_host, Admin, baseUrl);
				RequestView rw = rm.GetCurrentAction();
				String loadProc = rw.LoadProcedure;
				if (loadProc == null)
					throw new RequestModelException("The data model is empty");
				//loadPrms.Set("UserId", userId);
				//if (_host.IsMultiTenant)
				//loadPrms.Set("TenantId", tenantId);
				loadPrms.Set("Id", rw.Id);
				loadPrms.Append(rw.parameters);
				ExpandoObject prms2 = loadPrms;
				if (rw.indirect)
				{
					// for indirect action - @UserId and @Id only
					prms2 = new ExpandoObject();
					//prms2.Set("UserId", userId);
					//if (_host.IsMultiTenant)
					//prms2.Set("TenantId", tenantId);
					prms2.Set("Id", rw.Id);
				}
				IDataModel model = await _dbContext.LoadModelAsync(rw.CurrentSource, loadProc, prms2);
				rw = await LoadIndirect(rw, model, loadPrms);
				WriteDataModel(model, response.Output);
			}
			catch (Exception ex)
			{
				// TODO: COMMON
				if (ex.InnerException != null)
					ex = ex.InnerException;
				ProfileException(ex);
				response.SuppressContent = false;
				response.StatusCode = 255; // CUSTOM ERROR!!!!
				response.ContentType = "text/plain";
				response.StatusDescription = "Custom server error";
				response.Write(Localize(ex.Message));
			}
		}
	}
}
