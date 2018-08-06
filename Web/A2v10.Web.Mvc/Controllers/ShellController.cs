// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using System.Threading;
using System.Threading.Tasks;

using System.Dynamic;
using System.Text;
using System.Collections.Generic;

using System.IO;
using System.Drawing;
using System.Drawing.Imaging;

using Microsoft.AspNet.Identity;

using Newtonsoft.Json;
using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Mvc.Identity;
using A2v10.Web.Mvc.Filters;
using A2v10.Web.Mvc.Models;
using A2v10.Request.Models;
using System.Web;
using Microsoft.AspNet.Identity.Owin;

namespace A2v10.Web.Mvc.Controllers
{

	[Authorize]
	[ExecutingFilter]
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

			if (pathInfo.StartsWith("shell"))
			{
				await Shell(pathInfo, pathInfo.Contains("admin"));
			}
			else if (pathInfo.StartsWith("_page/"))
			{
				await Render(pathInfo.Substring(6), RequestUrlKind.Page);
			}
			else if (pathInfo.StartsWith("_model/"))
			{
				await RenderModel(pathInfo.Substring(7));
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
			else if (pathInfo.StartsWith("_upload/"))
			{
				await Upload("/" + pathInfo); // with _image prefix
			}
			else if (pathInfo.StartsWith("_export/"))
			{
				await Export("/" + pathInfo);
			}
			else if (pathInfo.StartsWith("file/"))
			{
				LoadFile(pathInfo.Substring(5));
			}
			else if (pathInfo.StartsWith("_static_image/"))
			{
				StaticImage(pathInfo.Substring(14).Replace('-', '.'));
			}
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

		async Task RenderModel(String pathInfo)
		{
			try
			{
				Response.ContentType = "text/javascript";
				ExpandoObject loadPrms = new ExpandoObject();
				loadPrms.Append(_baseController.CheckPeriod(Request.QueryString), toPascalCase: true);
				loadPrms.Set("UserId", UserId);
				if (_baseController.Host.IsMultiTenant)
					loadPrms.Set("TenantId", TenantId);
				await _baseController.RenderModel(pathInfo, loadPrms, Response.Output);
			}
			catch (Exception ex)
			{
				_baseController.WriteScriptException(ex, Response.Output);
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
				loadPrms.Set("UserId", UserId);
				if (_baseController.Host.IsMultiTenant)
					loadPrms.Set("TenantId", TenantId);
				if (pathInfo.StartsWith("app/"))
				{
					await _baseController.RenderApplicationKind(kind, pathInfo, loadPrms, Response.Output);
				}
				else
				{
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
					await _baseController.Data(command, TenantId, UserId, json, Response);
				}
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

		async Task Export(String path)
		{
			// HTTP GET
			try
			{
				ExpandoObject prms = new ExpandoObject();
				ExpandoObject loadPrms = new ExpandoObject();
				loadPrms.Append(_baseController.CheckPeriod(Request.QueryString), toPascalCase: true);
				loadPrms.Set("UserId", UserId);
				if (_baseController.Host.IsMultiTenant)
					loadPrms.Set("TenantId", TenantId);
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
				Int32 ix = path.LastIndexOf('-');
				if (ix != -1)
					path = path.Substring(0, ix) + "." + path.Substring(ix + 1);
				String fullPath = _baseController.Host.MakeFullPath(false, "_files/" + path, "");
				if (!System.IO.File.Exists(fullPath))
					throw new FileNotFoundException($"File not found '{path}'");
				Response.ContentType = MimeMapping.GetMimeMapping(path);
				using (var stream = System.IO.File.OpenRead(fullPath))
				{
					stream.CopyTo(Response.OutputStream);
				}
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
				await LoadAttachment(url);
			}
		}

		async Task Upload(String url)
		{
			if (Request.HttpMethod != "POST")
				throw new RequestModelException("Invalid HttpMethod for upload");
			if (IsNotAjax())
				return;
			Response.ContentType = "application/json";
			try
			{
				var files = Request.Files;
				await _baseController.SaveUploads(TenantId, url, files, UserId, Response.Output);
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex);
			}
		}

		async Task LoadAttachment(String url)
		{
			try
			{
				AttachmentInfo info = await _baseController.Attachment(TenantId, url, UserId);
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
				String result = JsonConvert.SerializeObject(rval, BaseController.StandardSerializerSettings);
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
				Boolean isUserAdmin = User.Identity.IsUserAdmin();
				if (admin && !isUserAdmin)
					throw new AccessViolationException("The current user is not an administrator");
				await _baseController.ShellScript(CatalogDataSource, TenantId, UserId, User.Identity.IsUserAdmin(), admin, Response.Output);
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
				_baseController.SendSupportEMail(text);
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
	}
}
