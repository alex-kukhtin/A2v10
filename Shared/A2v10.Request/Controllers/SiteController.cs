// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Web;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Request
{
	public class SiteController
	{

		private readonly BaseController _baseController;

		public SiteController()
		{
			_baseController = new BaseController();
		}

		public Func<Int64> UserId { get; set; }

		String NormalizeUrl(String url)
		{
			if (url != null && url.StartsWith("/"))
				url = url.Substring(1);
			if (String.IsNullOrEmpty(url))
				return "home/index/0";
			var urlSegments = url.Split('/');
			if (urlSegments.Length == 1)
				return url + "/index/0";
			return url;
		}

		public ExpandoObject CreateParams()
		{
			var loadPrms = new ExpandoObject();
			if (UserId != null)
				loadPrms.Set("UserId", UserId());
			return loadPrms;
		}

		public IDbContext DbContext => _baseController.DbContext;

		public Task<ViewInfo> LoadView(String pathInfo)
		{
			pathInfo = NormalizeUrl(pathInfo);
			return LoadViewKind(pathInfo, RequestUrlKind.Page);
		}

		public Task<ViewInfo> LoadDialog(String pathInfo)
		{
			return LoadViewKind(pathInfo, RequestUrlKind.Dialog);
		}

		async Task<ViewInfo> LoadViewKind(String pathInfo, RequestUrlKind kind)
		{
			var host = _baseController.Host;
			var rm = await RequestModel.CreateFromUrl(host, false, kind, NormalizeUrl(pathInfo));
			var rw = rm.GetCurrentAction();
			var pageId = $"el{Guid.NewGuid()}";
			var dmrw = await _baseController.GetDataModelForView(rw, CreateParams());
			rw = dmrw.RequestView;
			var viewInfo = new ViewInfo()
			{
				PageId = pageId,
				View = host.ApplicationReader.MakeRelativePath(rw.Path, $"{rw.GetView()}.cshtml"),
				Path = rw.Path,
				BaseUrl = rw.ParentModel.BasePath,
				DataModel = dmrw.Model,
				Id = rw.Id
			};

			var msi = new ModelScriptInfo()
			{
				DataModel = viewInfo.DataModel,
				RootId = pageId,
				IsDialog = rw.IsDialog,
				Template = rw.template,
				Path = rw.Path,
				BaseUrl = rw.ParentModel.BasePath
			};

			viewInfo.Scripts = await  _baseController.Scripter.GetModelScript(msi);

			return viewInfo;
		}

		public async Task Render(String pathInfo, HttpResponseBase Response)
		{
			var host = _baseController.Host;
			var rm = await RequestModel.CreateFromBaseUrl(host, false, pathInfo);
			var rw = rm.GetCurrentAction();
			var layoutText = host.ApplicationReader.ReadTextFile(String.Empty, "layout.html");
			if (layoutText == null)
				throw new FileNotFoundException("layout.html");
			String bodyText = host.ApplicationReader.MakeFullPath(rw.Path, $"{rw.GetView()}.html");
			if (bodyText == null)
				throw new FileNotFoundException(host.ApplicationReader.MakeFullPath(rw.Path, $"{rw.GetView()}.html"));
			String script = String.Empty;
			if (!String.IsNullOrEmpty(rw.script))
			{
				String jsfileText = host.ApplicationReader.ReadTextFile(rw.Path, $"{rw.script}.js");
				if (jsfileText == null)
					throw new FileNotFoundException($"{rw.script}.js");
				var sb = new StringBuilder("<script type=\"text/javascript\">")
					.AppendLine("'use strict';\n(function() {" )
					.AppendLine(jsfileText)
					.AppendLine("})();")
					.AppendLine("</script>");
				script = sb.ToString();
			}
			StringBuilder html = new StringBuilder(layoutText);

			// todo : render body
			html.Replace("@RenderBody()", bodyText);
			html.Replace("@RenderScript()", script);

			Response.ContentType = "text/html";
			Response.Write(html.ToString());
		}

		public async Task Data(String command, HttpRequestBase Request, HttpResponseBase Response)
		{
			Response.ContentType = "application/json";
			using (var tr = new StreamReader(Request.InputStream))
			{
				String json = tr.ReadToEnd();
				await _baseController.Data(command, SetParams, json, Response);
			}
		}

		void SetParams(ExpandoObject prms)
		{
			if (UserId != null) {
				prms.Set("UserId", UserId());
			}
		}

		public async Task<Boolean> ProcessRequest(String pathInfo, HttpRequestBase Request, HttpResponseBase Response)
		{
			if (pathInfo == null)
				return false;
			if (pathInfo.StartsWith("_data/"))
			{
				String command = pathInfo.Substring(6);
				await Data(command, Request, Response);
				return true;
			}
			return false;
		}

		public void WriteExceptionStatus(Exception ex, HttpResponseBase response)
		{
			_baseController.WriteExceptionStatus(ex, response);
		}

		public Task Server(String command, String baseUrl, HttpResponseBase response)
		{
			Int64 userId = 0;
			if (UserId != null)
				userId = UserId();
			return _baseController.Server(command, baseUrl, userId, response);
		}
	}
}
