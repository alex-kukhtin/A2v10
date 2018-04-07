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
			else if (pathInfo.StartsWith("_export/"))
			{
				await Export("/" + pathInfo);
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
				var prms = new Dictionary<String, String>();
				prms.Add("$(RootUrl)", RootUrl);
				prms.Add("$(HelpUrl)", _baseController.Host.HelpUrl);
				prms.Add("$(PersonName)", User.Identity.GetUserPersonName());
				prms.Add("$(Theme)", _baseController.Host.Theme);
				prms.Add("$(Build)", _baseController.Host.AppBuild);
				prms.Add("$(Locale)", _baseController.CurrentLang);
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
				loadPrms.Append(Request.QueryString, toPascalCase: true);
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
					await _baseController.Data(command, TenantId, UserId, json, Response.Output);
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
				ImageInfo info = _baseController.StaticImage(url);
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

		async Task Export(String path)
		{
			// HTTP GET
			try
			{
				ExpandoObject prms = new ExpandoObject();
				ExpandoObject loadPrms = new ExpandoObject();
				loadPrms.Append(Request.QueryString, toPascalCase: true);
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

		async Task LoadImage(String url)
		{
			try
			{
				ImageInfo info = await _baseController.Image(TenantId, url, UserId);
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
				var list = await _baseController.SaveImages(TenantId, url, files, UserId);
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
			Response.Write(_baseController.GetAppStyleConent());
		}

		protected void WriteExceptionStatus(Exception ex)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			_baseController.ProfileException(ex);
			Response.SuppressContent = false;
			Response.StatusCode = 255; // CUSTOM ERROR!!!!
			Response.ContentType = "text/plain";
			Response.StatusDescription = "Custom server error";
			Response.Write(_baseController.Localize(ex.Message));
		}
	}
}
