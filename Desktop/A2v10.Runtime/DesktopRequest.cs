// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Dynamic;
using System.IO;
using System.Text;
using System.Web;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Web.Mvc.Controllers;
using Newtonsoft.Json;

namespace A2v10.Runtime
{
	public class DesktopUserInfo : IUserInfo
	{
		public Int64 UserId { get; set; }
		public Boolean IsAdmin { get; set; }
		public Boolean IsTenantAdmin { get; set; }
	}

	public class DesktopRequest
	{
		private readonly BaseController _controller;
		private readonly ISupportUserInfo _userInfo;

		public DesktopRequest()
		{
			_controller = new BaseController();
			_userInfo = ServiceLocator.Current.GetService<ISupportUserInfo>();
		}

		public String Search { get; set; }

		public String MimeType { get; private set; }
		public String ContentDisposition { get; private set; }
		public Int32 StatusCode { get; private set; }

		const String MIME_JSON   = "application/json";
		const String MIME_HTML   = "text/html";
		const String MIME_SCRIPT = "text/javascript";
		const String MIME_STYLE  = "text/css";

		public Byte[] ProcessRequest(String url, Byte[] post, Boolean postMethod)
		{
			_controller.Host.StartApplication(false); // TODO: ?ADMIN?
			using (_controller.Host.Profiler.BeginRequest(url, null) as IDisposable)
			{
				try
				{
					return ProcessRequestImpl(url, post, postMethod);
				}
				catch (Exception /*ex*/)
				{
					throw;
				}
			}
		}

		Byte[] ProcessRequestImpl(String url, Byte[] post, Boolean postMethod)
		{
			if (url.StartsWith("admin/"))
			{
				url = url.Substring(6);
				_controller.Admin = true;
			}
			_controller.Host.StartApplication(_controller.Admin);
			try
			{
				MimeType = MIME_HTML;
				using (var dr = new DesktopResponse())
				{
					if (String.IsNullOrEmpty(url))
						RenderIndex(dr.Output);
					else if (url.StartsWith("shell/"))
					{
						Shell(url.Substring(6).ToLowerInvariant(), dr.Output, out String shellMime);
						MimeType = shellMime;
					}
					else if (url.StartsWith("report/"))
					{
						Report(url.Substring(6).ToLowerInvariant(), dr);
						MimeType = dr.ContentType;
						ContentDisposition = dr.Headers["Content-Disposition"];
						if (dr.IsBinaryWrited)
							return dr.GetBytes();
					}
					else if (url.StartsWith("_page/"))
						Render(RequestUrlKind.Page, url.Substring(6), dr.Output);
					else if (url.StartsWith("_dialog/"))
						Render(RequestUrlKind.Dialog, url.Substring(8), dr.Output);
					else if (url.StartsWith("_popup/"))
						Render(RequestUrlKind.Popup, url.Substring(7), dr.Output);
					else if (url.StartsWith("_data/"))
					{
						var command = url.Substring(6);
						dr.ContentType = "application/json";
						String jsonData = Encoding.UTF8.GetString(post);
						_controller.Data(command, SetSqlQueryParams, jsonData, dr).Wait();
						MimeType = dr.ContentType;
						if (dr.IsBinaryWrited)
							return dr.GetBytes();
					}
					else if (url.StartsWith("_image/"))
					{
						if (postMethod)
							throw new NotImplementedException("SaveImage (post)");
						else
						{
							var bytes = LoadImage("/" + url, dr);
							MimeType = dr.ContentType;
							return bytes;
						}
					}
					else if (url.StartsWith("_static_image/"))
					{
						var bytes = StaticImage(url.Substring(14).Replace('-', '.'), dr);
						MimeType = dr.ContentType;
						return bytes;
					}
					else if (url.StartsWith("_export/"))
					{
						Export("/" + url, dr);
						MimeType = dr.ContentType;
						ContentDisposition = dr.Headers["Content-Disposition"];
						return dr.GetBytes();
					}
					else if (url.StartsWith("_application/"))
					{
						if (!postMethod)
							throw new InvalidOperationException();
						var command = url.Substring(13);
						String jsonData = Encoding.UTF8.GetString(post);
						_controller.ApplicationCommand(command, SetUserTenantToParams, jsonData, dr).Wait();
						MimeType = MIME_JSON;
						if (dr.OutputStream.Length == 0)
							dr.Output.WriteLine("{}");
						return Encoding.UTF8.GetBytes(dr.Output.ToString());
					}
					else if (url.StartsWith("fragment/"))
					{
						LoadFragment(url.Substring(9), dr);
						MimeType = dr.ContentType;
						return dr.GetBytes();
					}
					else
						RenderIndex(dr.Output);
					return Encoding.UTF8.GetBytes(dr.Output.ToString());
				}
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				// TODO:: /exception
				StatusCode = 255;
				return Encoding.UTF8.GetBytes(_controller.Localize(ex.Message));
			}
		}

		public Int64 UserId { get { return _userInfo.UserInfo.UserId; } }
		public Int32 TenantId { get { return 1; /*TODO: multi tenant mode */} }
		public Int64 CompanyId => _controller.UserStateManager.UserCompanyId(TenantId, UserId);

		public void SetUserTenantToParams(ExpandoObject prms)
		{
			prms.Set("UserId", UserId);
			prms.Set("TenantId", TenantId);
			//A2v10.Infrastructure.DynamicHelpers.Set(prms, "UserId", UserId);
			//A2v10.Infrastructure.DynamicHelpers.Set(prms, "TenantId", TenantId);
		}

		void SetUserCompanyToParams(ExpandoObject prms)
		{
			if (_controller.Host.IsMultiCompany)
				prms.Set("CompanyId", CompanyId);
		}

		void SetSqlQueryParams(ExpandoObject prms)
		{
			SetUserTenantToParams(prms);
			SetUserCompanyToParams(prms);
		}

		void SetQueryStringAndSqlQueryParams(ExpandoObject prms)
		{
			SetUserTenantToParams(prms);
			SetUserCompanyToParams(prms);
			prms.Append(_controller.CheckPeriod(HttpUtility.ParseQueryString(this.Search)), toPascalCase: true);
		}

		void Render(RequestUrlKind kind, String path, TextWriter writer)
		{
			ExpandoObject loadPrms = new ExpandoObject();
			path = path.ToLowerInvariant();
			loadPrms.Append(_controller.CheckPeriod(HttpUtility.ParseQueryString(Search)), toPascalCase: true);
			SetSqlQueryParams(loadPrms);
			if (path.StartsWith("app/"))
				_controller.RenderApplicationKind(kind, path, loadPrms, writer).Wait();
			else
				_controller.RenderElementKind(kind, path, loadPrms, writer).Wait();
		}

		public String GetCompanyButton()
		{
			if (!_controller.Host.IsMultiCompany)
				return String.Empty;
			return "<a2-company-button :source=\"companies.menu\" :links=\"companies.links\"></a2-company-button>";
		}

		void RenderIndex(TextWriter writer)
		{
			String userName = _userInfo.UserInfo.PersonName;
			if (String.IsNullOrEmpty(userName))
				userName = _userInfo.UserInfo.UserName;
			String locale = "uk"; // TODO: ctrl.CurrentLang
			String theme = "site"; // TODO: ctrl.Host.Theme
			var prms = new Dictionary<String, String>
				{
					{ "$(RootUrl)", String.Empty },
					{ "$(HelpUrl)", _controller.Host.HelpUrl },
					{ "$(PersonName)", userName },
					{ "$(CompanyButton)", GetCompanyButton()},
					{ "$(Theme)", theme },
					{ "$(Build)", _controller.Host.AppBuild },
					{ "$(Locale)", locale },
					{ "$(Minify)", _controller.IsDebugConfiguration ? String.Empty : "min." },
					{ "$(Description)", _controller.Host.AppDescription }
				};
			_controller.Layout(writer, prms);
		}

		public void Report(String url, DesktopResponse dr)
		{
			var reportController = new ReportController();
			var qry = HttpUtility.ParseQueryString(Search?.ToLowerInvariant());
			/*  /export/{id} */
			var urlParts = url.ToLowerInvariant().Split('/');
			var rep = qry.Get("rep");
			var baseUrl = qry.Get("base");
			var format = qry.Get("format");
			var id = urlParts[urlParts.Length - 1];
			if (urlParts[1] == "export")
			{
				DesktopReport ri = new DesktopReport()
				{
					Report = rep,
					Base = baseUrl,
					Id = id,
					Format = format,
					UserId = UserId,
					TenantId = TenantId,
					CompanyId = CompanyId,
					AddContentDisposition = true
				};
				reportController.ExportDesktop(ri, dr).Wait();
			}
			else if (urlParts[1] == "print")
			{
				DesktopReport ri = new DesktopReport()
				{
					Report = rep,
					Base = baseUrl,
					Id = id,
					Format = "pdf",
					UserId = UserId,
					TenantId = TenantId,
					CompanyId = CompanyId,
					AddContentDisposition = false
				};
				reportController.ExportDesktop(ri, dr).Wait();
			}
		}

		public void Shell(String url, TextWriter writer, out String mimeType)
		{
			mimeType = MIME_SCRIPT;
			switch (url)
			{
				case "appstyles":
					_controller.GetAppStyleConent(writer);
					mimeType = MIME_STYLE;
					break;
				case "appscripts":
					_controller.GetAppScriptConent(writer);
					mimeType = MIME_STYLE;
					break;
				case "script":
					try
					{
						var userInfo = new DesktopUserInfo();
						_controller.ShellScript(null, SetUserTenantToParams, userInfo, bAdmin: false, writer: writer).Wait();
						mimeType = MIME_SCRIPT;
					}
					catch (Exception ex)
					{
						if (ex.InnerException != null)
							ex = ex.InnerException;
						writer.Write($"alert('{ex.Message.EncodeJs()}')");
					}
					break;
				case "trace":
					String json = _controller.Host.Profiler.GetJson();
					mimeType = MIME_JSON;
					writer.Write(json);
					break;
			}
		}


		Byte[] LoadImage(String url, HttpResponseBase response)
		{
			try
			{
				AttachmentInfo info = _controller.DownloadAttachment(url, SetSqlQueryParams).Result;
				if (info == null)
					return null;
				response.ContentType = info.Mime;
				if (info.Stream == null)
					return null;
				return info.Stream;
			}
			catch (Exception ex)
			{
				return GetImageException(ex, response);
			}
		}

		Byte[] StaticImage(String url, HttpResponseBase response)
		{
			try
			{
				AttachmentInfo info = _controller.StaticImage(url);
				if (info == null || info.Stream == null)
					return null;
				response.ContentType = info.Mime;
				return info.Stream;
			}
			catch (Exception ex)
			{
				return GetImageException(ex, response);
			}
		}

		Byte[] GetImageException(Exception ex, HttpResponseBase response)
		{
			response.ContentType = "image/png";
			if (ex.InnerException != null)
				ex = ex.InnerException;
			using (var b = new Bitmap(380, 30))
			{
				using (var g = Graphics.FromImage(b))
				{
					g.FillRectangle(Brushes.LavenderBlush, new Rectangle(0, 0, 380, 30));
					g.DrawString(ex.Message, SystemFonts.SmallCaptionFont, Brushes.DarkRed, 5, 5, StringFormat.GenericTypographic);
					g.Save();
					using (var ms = new MemoryStream())
					{
						b.Save(ms, ImageFormat.Png);
						ms.Seek(0, SeekOrigin.Begin);
						return ms.GetBuffer();
					}
				}
			}
		}

		public Byte[] SaveImage(String url,  String files, DesktopResponse dr)
		{
			dr.ContentType = "application/json";
			try
			{
				var fileColl = new SimpleHttpFileCollection(files);
				var list = _controller.SaveAttachments(TenantId, url, fileColl, UserId).Result;
				var rval = new ExpandoObject();
				rval.Set("status", "OK");
				rval.Set("ids", list);
				String result = JsonConvert.SerializeObject(rval, JsonHelpers.StandardSerializerSettings);
				return Encoding.UTF8.GetBytes(result);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				MimeType = "text/plain";
				StatusCode = 255;
				String msg = $"{ex.Message}";
				return Encoding.UTF8.GetBytes(msg);
			}
		}

		public Byte[] UploadFiles(String url, String files, DesktopResponse dr)
		{
			try
			{
				dr.ContentType = "application/json";
				var fileColl = new SimpleHttpFileCollection(files);
				_controller.SaveFiles("/" + url, fileColl, SetQueryStringAndSqlQueryParams, dr.Output).Wait();
				MimeType = dr.ContentType;
				StatusCode = dr.StatusCode;
				return Encoding.UTF8.GetBytes(dr.Output.ToString());
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				MimeType = "text/plain";
				StatusCode = 255;
				String msg = $"{ex.Message}";
				return Encoding.UTF8.GetBytes(msg);
			}
		}

		void WriteExceptionStatus(Exception ex, HttpResponseBase response)
		{
			response.ContentType = "clr/error+server";
			if (ex.InnerException != null)
				ex = ex.InnerException;
			response.Write(Encoding.UTF8.GetBytes(ex.Message));
		}

		void Export(String path, HttpResponseBase response)
		{
			// HTTP GET
			try
			{
				ExpandoObject loadPrms = new ExpandoObject();
				loadPrms.Append(_controller.CheckPeriod(HttpUtility.ParseQueryString(Search)), toPascalCase: true);
				SetSqlQueryParams(loadPrms);
				_controller.Export(path, TenantId, UserId, loadPrms, response).Wait();
			}
			catch (Exception ex)
			{
				WriteExceptionStatus(ex, response);
			}
		}

		void LoadFragment(String path, HttpResponseBase resp)
		{
			// HTTP GET
			var appReader = _controller.Host.ApplicationReader;
			Int32 ix = path.LastIndexOf('-');
			if (ix != -1)
				path = path.Substring(0, ix) + "." + path.Substring(ix + 1);
			path += $".{_controller.CurrentLang}.html";
			String fullPath = appReader.MakeFullPath("_fragments/" + path, "");
			if (!appReader.FileExists(fullPath))
				throw new FileNotFoundException($"File not found '{path}'");
			resp.ContentType = "text/html";
			using (var stream = appReader.FileStreamFullPathRO(fullPath))
			{
				stream.CopyTo(resp.OutputStream);
			}
		}
	}
}
