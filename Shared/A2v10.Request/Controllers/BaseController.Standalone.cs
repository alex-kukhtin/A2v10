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

		public async Task StandaloneLoadData(HttpRequestBase request, HttpResponseBase response)
		{
			if (request.HttpMethod != "POST")
				return;
			response.ContentType = "application/json";
			try
			{
				String json = null;
				using (var tr = new StreamReader(request.InputStream))
					json = tr.ReadToEnd();
				await ReloadData(null, json, response.Output);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex, response);
			}
		}


		public async Task StandaloneSaveData(HttpRequestBase request, HttpResponseBase response)
		{
			if (request.HttpMethod != "POST")
				return;
			try
			{
				String json = null;
				using (var tr = new StreamReader(request.InputStream))
					json = tr.ReadToEnd();
				response.ContentType = "application/json";
				await SaveData(null, json, response.Output);
			}
			catch (Exception ex) {
				WriteExceptionStatus(ex, response);
			}
		}
	}
}
