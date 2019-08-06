// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using System.Threading.Tasks;

using System.Dynamic;
using System.Text;
using System.Collections.Generic;

using System.IO;
using System.Drawing;
using System.Drawing.Imaging;
using System.Web;

using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Identity;
using A2v10.Web.Mvc.Filters;
using A2v10.Request.Models;
using System.Net.Http.Headers;
using System.Linq;

namespace A2v10.Web.Mvc.Controllers
{

	[AuthorizeFilter]
	[ExecutingFilter]
	[CheckMobileFilter]
	public class ShellController : Controller, IControllerProfiler, IControllerTenant
	{
		A2v10.Request.BaseController _baseController = new BaseController();

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();
		public String CatalogDataSource => _baseController.Host.CatalogDataSource;

		public ShellController()
		{
		}

		#region IControllerProfiler
		public IProfiler Profiler => _baseController.Host.Profiler;
		#endregion

		protected String RootUrl
		{
			get
			{
				String url = _baseController.Admin ? Url.Content("~/admin") : Url.Content("~");
				if (url == "/")
					url = String.Empty;
				if (url.EndsWith("/"))
					url = url.Substring(url.Length - 1);
				return url;
			}
		}

		#region IControllerTenant
		public void StartTenant()
		{
			var host = ServiceLocator.Current.GetService<IApplicationHost>();
			host.TenantId = TenantId;
		}
		#endregion

		public async Task Default(String pathInfo)
		{
			// simple routing
			Response.ContentEncoding = Encoding.UTF8;
			Response.HeaderEncoding = Encoding.UTF8;

			if (String.IsNullOrEmpty(pathInfo))
			{
				_baseController.Host.StartApplication(false);
				Index(); // root
				return;
			}

			pathInfo = pathInfo.ToLowerInvariant();

			if (pathInfo.StartsWith("admin/"))
			{
				pathInfo = pathInfo.Substring(6);
				// ADMIN mode
				_baseController.Admin = true;
			}

			_baseController.Host.StartApplication(_baseController.Admin);

			if (pathInfo.EndsWith(".ts"))
			{
				TypeScriptSource(pathInfo);
				return;
			}

			if (pathInfo.StartsWith("shell"))
			{
				Boolean adminShell = pathInfo.Contains("admin");
				if (adminShell)
					_baseController.Admin = true;
				await Shell(pathInfo, adminShell);
			}
			else if (pathInfo.StartsWith("_page/"))
			{
				await Render(pathInfo.Substring(6), RequestUrlKind.Page);
			}
			else if (pathInfo.StartsWith("_dialog/"))
			{
				await Render(pathInfo.Substring(8), RequestUrlKind.Dialog);
			}
			else if (pathInfo.StartsWith("_popup/"))
			{
				await Render(pathInfo.Substring(7), RequestUrlKind.Popup);
			}
			else if (pathInfo.StartsWith("_data/"))
			{
				String command = pathInfo.Substring(6);
				await Data(command);
			}
			else if (pathInfo.StartsWith("_image/"))
			{
				await Image("/" + pathInfo); // with _image prefix
			}
			else if (pathInfo.StartsWith("_attachment/"))
			{
				await Attachment("/" + pathInfo); // with _attachment/ prefix
			}
			else if (pathInfo.StartsWith("_file/"))
			{
				await DoFile("/" + pathInfo); // with _image prefix
			}
			else if (pathInfo.StartsWith("_export/"))
			{
				await Export("/" + pathInfo);
			}
			else if (pathInfo.StartsWith("_iframe/"))
			{
				await IFrame("/" + pathInfo);
			}
			else if (pathInfo.StartsWith("file/"))
			{
				LoadFile(pathInfo.Substring(5));
			}
			else if (pathInfo.StartsWith("fragment/"))
			{
				LoadFragment(pathInfo.Substring(9));
			}
			else if (pathInfo.StartsWith("_static_image/"))
			{
				StaticImage(pathInfo.Substring(14).Replace('-', '.'));
			}
			else if (pathInfo.StartsWith("_server"))
				await RunServer(pathInfo.Substring(8));
			else
			{
				Index(); // root element (always)
			}
		}

		public void Index()
		{
			try
			{
				Response.ContentType = "text/html";
				var prms = new Dictionary<String, String>
				{
					{ "$(RootUrl)", RootUrl },
					{ "$(HelpUrl)", _baseController.Host.HelpUrl },
					{ "$(PersonName)", Server.HtmlEncode(User.Identity.GetUserPersonName()) },
					{ "$(Theme)", _baseController.Host.Theme },
					{ "$(Build)", _baseController.Host.AppBuild },
					{ "$(Locale)", _baseController.CurrentLang },
					{ "$(Minify)", _baseController.IsDebugConfiguration ? String.Empty : "min." },
					{ "$(Description)", _baseController.Host.AppDescription }
				};
				_baseController.Layout(Response.Output, prms);
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}


		async Task Render(String pathInfo, RequestUrlKind kind)
		{
			//  Ajax
			if (IsNotAjax())
				return;
			try
			{
				Response.ContentType = "text/html";
				ExpandoObject loadPrms = new ExpandoObject();
				loadPrms.Append(_baseController.CheckPeriod(Request.QueryString), toPascalCase: true);
				if (pathInfo.StartsWith("app/"))
				{
					SetUserTenantToParams(loadPrms); // without claims
					await _baseController.RenderApplicationKind(kind, pathInfo, loadPrms, Response.Output);
				}
				else
				{
					SetSqlQueryParams(loadPrms);
					await _baseController.RenderElementKind(kind, pathInfo, loadPrms, Response.Output);
				}
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}

		Boolean IsNotAjax()
		{
			if (Request.IsAjaxRequest())
				return false;
			Response.StatusCode = 404;
			return true;
		}

		async Task Data(String command)
		{
			//  Ajax
			if (IsNotAjax())
				return;
			if (Request.HttpMethod != "POST")
				return;
			Response.ContentType = "application/json";
			try
			{
				using (var tr = new StreamReader(Request.InputStream))
				{
					String json = tr.ReadToEnd();
					await _baseController.Data(command, SetSqlQueryParams, json, Response);
				}
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}

		async Task RunServer(String pathInfo)
		{
			try
			{
				var baseUrl = Request.QueryString["baseUrl"];
				await _baseController.Server(pathInfo, baseUrl, UserId, Response);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}

		void StaticImage(String url)
		{
			try
			{
				AttachmentInfo info = _baseController.StaticImage(url);
				if (info == null || info.Stream == null)
					return;
				Response.ContentType = info.Mime;
				Response.BinaryWrite(info.Stream);
			}
			catch (Exception ex)
			{
				WriteImageException(ex);
			}
		}

		void SetQueryStringAndSqlQueryParams(ExpandoObject prms)
		{
			SetUserTenantToParams(prms);
			SetClaimsToParams(prms);
			prms.Append(_baseController.CheckPeriod(Request.QueryString), toPascalCase: true);
		}

		void SetSqlQueryParams(ExpandoObject prms)
		{
			SetUserTenantToParams(prms);
			SetClaimsToParams(prms);
		}

		void SetUserTenantToParams(ExpandoObject prms)
		{
			prms.Set("UserId", UserId);
			if (_baseController.Host.IsMultiTenant)
				prms.Set("TenantId", TenantId);
		}

		void SetClaimsToParams(ExpandoObject prms)
		{
			if (_baseController.Admin)
				return; // no claims for admin application
			String claims = _baseController.Host.UseClaims;
			if (String.IsNullOrEmpty(claims))
				return;
			foreach (var s in claims.Split(','))
			{
				var strClaim = s.Trim().ToLowerInvariant();
				prms.Set(strClaim.ToPascalCase(), User.Identity.GetUserClaim(strClaim));
			}
		}

		async Task IFrame(String path)
		{
			// HTTP GET
			try
			{
				ExpandoObject loadPrms = new ExpandoObject();
				SetSqlQueryParams(loadPrms);
				await _baseController.RenderEUSignIFrame(Response.Output, path, loadPrms);
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}

		async Task Export(String path)
		{
			// HTTP GET
			try
			{
				ExpandoObject prms = new ExpandoObject();
				ExpandoObject loadPrms = new ExpandoObject();
				loadPrms.Append(_baseController.CheckPeriod(Request.QueryString), toPascalCase: true);
				SetSqlQueryParams(loadPrms);
				await _baseController.Export(path, TenantId, UserId, loadPrms, Response);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}

		void LoadFile(String path)
		{
			// HTTP GET
			try
			{
				var appReader = _baseController.Host.ApplicationReader;
				Int32 ix = path.LastIndexOf('-');
				if (ix != -1)
					path = path.Substring(0, ix) + "." + path.Substring(ix + 1);
				String fullPath = appReader.MakeFullPath("_files/" + path, "");
				if (!appReader.FileExists(fullPath))
					throw new FileNotFoundException($"File not found '{path}'");
				Response.ContentType = MimeMapping.GetMimeMapping(path);
				using (var stream = appReader.FileStreamFullPathRO(fullPath))
				{
					stream.CopyTo(Response.OutputStream);
				}
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}

		void LoadFragment(String path)
		{
			// HTTP GET
			try
			{
				var appReader = _baseController.Host.ApplicationReader;
				Int32 ix = path.LastIndexOf('-');
				if (ix != -1)
					path = path.Substring(0, ix) + "." + path.Substring(ix + 1);
				path += $".{_baseController.CurrentLang}.html";
				String fullPath = appReader.MakeFullPath("_fragments/" + path, "");
				if (!appReader.FileExists(fullPath))
					throw new FileNotFoundException($"File not found '{path}'");
				Response.ContentType = "text/html";
				using (var stream = appReader.FileStreamFullPathRO(fullPath))
				{
					stream.CopyTo(Response.OutputStream);
				}
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}


		async Task Attachment(String url)
		{
			try
			{
				AttachmentInfo info = await _baseController.DownloadAttachment(url, SetSqlQueryParams);
				if (info == null)
					return;
				Response.ContentType = info.Mime;
				if (info.Stream == null)
					return;
				Response.BinaryWrite(info.Stream);
			}
			catch (Exception ex)
			{
				_baseController.WriteHtmlException(ex, Response.Output);
			}
		}

		async Task Image(String url)
		{
			if (Request.HttpMethod == "POST")
			{
				await SaveImage(url);
			}
			else
			{
				await LoadImage(url);
			}
		}

		async Task DoFile(String url)
		{
			switch (Request.HttpMethod.ToUpperInvariant())
			{
				case "POST":
					if (IsNotAjax())
						return;
					Response.ContentType = "application/json";
					try
					{
						var files = Request.Files;
						await _baseController.SaveFiles(url, files, SetQueryStringAndSqlQueryParams, Response.Output);
					}
					catch (Exception ex)
					{
						WriteExceptionStatus(ex);
					}
					break;
				case "GET":
					try
					{
						var ai = await _baseController.LoadFileGet(url, SetQueryStringAndSqlQueryParams);
						if (ai == null)
							return;
						Response.ContentType = ai.Mime;
						if (Request.QueryString["export"] != null)
						{
							var cdh = new ContentDispositionHeaderValue("attachment")
							{
								FileNameStar = _baseController.Localize(ai.Name)
							};
							Response.Headers.Add("Content-Disposition", cdh.ToString());
						}
						if (ai.Stream == null)
							return;
						Response.BinaryWrite(ai.Stream);
					}
					catch (Exception ex)
					{
						WriteExceptionStatus(ex);
					}
					break;
			}
		}

		async Task LoadImage(String url)
		{
			try
			{
				AttachmentInfo info = await _baseController.DownloadAttachment(url, SetSqlQueryParams);
				if (info == null)
					return;
				Response.ContentType = info.Mime;
				if (info.Stream == null)
					return;
				Response.BinaryWrite(info.Stream);
			}
			catch (Exception ex)
			{
				WriteImageException(ex);
			}
		}

		void WriteImageException(Exception ex)
		{
			Response.ContentType = "image/png";
			if (ex.InnerException != null)
				ex = ex.InnerException;
			var b = new Bitmap(380, 30);
			var g = Graphics.FromImage(b);
			g.FillRectangle(Brushes.LavenderBlush, new Rectangle(0, 0, 380, 30));
			g.DrawString(ex.Message, SystemFonts.SmallCaptionFont, Brushes.DarkRed, 5, 5, StringFormat.GenericTypographic);
			g.Save();
			b.Save(Response.OutputStream, ImageFormat.Png);
		}

		async Task SaveImage(String url)
		{
			if (IsNotAjax())
				return;
			Response.ContentType = "application/json";
			try
			{
				var files = Request.Files;
				var list = await _baseController.SaveAttachments(TenantId, url, files, UserId);
				var rval = new ExpandoObject();
				rval.Set("status", "OK");
				rval.Set("ids", list);
				String result = JsonConvert.SerializeObject(rval, JsonHelpers.StandardSerializerSettings);
				Response.Write(result);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}

		async Task Shell(String pathInfo, Boolean bAdmin)
		{
			if (pathInfo.StartsWith("shell/script"))
				await ShellScript(bAdmin);
			else if (pathInfo.StartsWith("shell/trace"))
				ShellTrace();
			else if (pathInfo.StartsWith("shell/appstyles"))
				ShellAppStyles();
			else if (pathInfo.StartsWith("shell/appscripts"))
				ShellAppScripts();
			else if (pathInfo.StartsWith("shell/savefeedback"))
				await ShellSaveFeedback();
			else
				throw new RequestModelException($"Invalid shell action: '{pathInfo}'");
		}

		async Task ShellScript(Boolean admin)
		{
			Response.ContentType = "application/javascript";
			try
			{
				var userInfo = User.Identity.UserInfo();

				if (admin && !userInfo.IsAdmin)
					throw new AccessViolationException("The current user is not an administrator");

				await _baseController.ShellScript(CatalogDataSource, SetSqlQueryParams, userInfo, admin, Response.Output);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.Write($"alert('{ex.Message.EncodeJs()}')");
			}
		}

		void ShellTrace()
		{
			try
			{
				String json = _baseController.Host.Profiler.GetJson();
				Response.ContentType = "application/json";
				Response.Write(json);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}

		void ShellAppStyles()
		{
			Response.ContentType = "text/css";
			_baseController.GetAppStyleConent(Response.Output);
		}

		void ShellAppScripts()
		{
			Response.ContentType = "text/javascript";
			_baseController.GetAppScriptConent(Response.Output);
		}

		async Task ShellSaveFeedback()
		{
			Response.ContentType = "application/json";
			try
			{
				String json = null;
				using (var tr = new StreamReader(Request.InputStream))
				{
					json = tr.ReadToEnd();
				}
				var model = JsonConvert.DeserializeObject<SaveFeedbackModel>(json);
				model.UserId = this.UserId;
				await _baseController.SaveFeedback(model);
				Response.Output.Write($"{{\"status\": \"OK\"}}");

				var context = HttpContext.GetOwinContext();
				var userManager = context.GetUserManager<AppUserManager>();
				var appUser = userManager.FindById(this.UserId);

				String text = $"UserId: {appUser.Id}<br>UserName: {appUser.PersonName}<br>Login: {appUser.UserName}<br></br><p>{model.Text}</p>";
				await _baseController.SendSupportEMailAsync(text);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}


		protected void WriteExceptionStatus(Exception ex)
		{
			_baseController.WriteExceptionStatus(ex, Response);
		}

		void TypeScriptSource(String pathInfo)
		{
			// path/[action|dialog|etc]/ts-file
			Response.ContentType = "application/x-typescript";
			String[] segments = pathInfo.Split('/');
			Int32 len = segments.Length;
			if (len < 3)
				throw new RequestModelException($"Invalid typescript request: '{pathInfo}'");
			String segmentPath = Path.Combine(segments.Take(len - 2).ToArray<String>());
			String fullPath = _baseController.Host.ApplicationReader.MakeFullPath(segmentPath, segments[len-1]);
			String content = System.IO.File.ReadAllText(fullPath);
			Response.Write(content);
		}
	}
}
