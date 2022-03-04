// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Web.Mvc;
using System.Threading.Tasks;
using System.IO;
using System.Dynamic;
using System.Web;
using System.Xml;
using System.Xml.Linq;
using System.Text;

using Microsoft.AspNet.Identity;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using A2v10.Request;
using A2v10.Interop;
using A2v10.Web.Identity;
using System.Security.Claims;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Controllers
{

	public class ClrRequestInfo : IRequestInfo
	{
		private HttpRequestBase _request;

		public ClrRequestInfo(HttpRequestBase request)
		{
			_request = request;
		}

		public String HostAddress => _request.UserHostAddress;
		public String HostName => _request.UserHostName;
		public String HostText
		{
			get
			{
				if (_request.UserHostName == _request.UserHostAddress)
					return _request.UserHostName;
				return $"{_request.UserHostName} [{_request.UserHostAddress}]";
			}
		}
	}

	[AllowAnonymous]
	public class ApiController : Controller, IControllerTenant
	{
		private readonly A2v10.Request.BaseController _baseController = new BaseController();
		private readonly ILogger _logger;
		private readonly IDbContext _dbContext;

		public ApiController()
		{
			_logger = ServiceLocator.Current.GetService<ILogger>();
			_dbContext = ServiceLocator.Current.GetService<IDbContext>();
			_baseController.Host.StartApplication(false);
		}

		#region IControllerTenant
		public void StartTenant()
		{
			var host = ServiceLocator.Current.GetService<IApplicationHost>();
			host.TenantId = TenantId;
			host.UserId = UserId;
			host.UserSegment = UserSegment;
		}
		#endregion

		public Int64? UserId
		{
			get
			{
				if (User.Identity == null)
					return null;
				return User.Identity.GetUserId<Int64>();
			}
		}

		public Int32 TenantId => User.Identity.GetUserTenantId();
		public String UserSegment => User.Identity.GetUserSegment();

		Boolean ValidAllowAddress(RequestCommand ac)
		{
			if (String.IsNullOrEmpty(ac.AllowAddressForCheck))
				return true;
			if (!ac.AllowAddressForCheck.Contains(Request.UserHostAddress))
			{
				Response.StatusCode = 403; // forbidden
				return false;
			}
			return true;
		}

		Boolean ValidHosts(RequestCommand ac)
		{
			if (String.IsNullOrEmpty(ac.AllowHostForCheck))
				return true;
			var refer = Request.UrlReferrer;
			if (refer == null || !ac.AllowHostForCheck.Contains(refer.Host))
			{
				Response.StatusCode = 403; // forbidden
				return false;
			}
			return true;
		}

		[HttpGet]
		[ActionName("Default")]
		public async Task DefaultGET(String pathInfo)
		{
			Guid apiGuid = Guid.NewGuid();
			try
			{
				var qs = Request.QueryString?.ToString();
				if (!String.IsNullOrEmpty(qs))
					qs = $" query:{qs}";
				_logger.LogApi($"get: {pathInfo}{qs}", Request.UserHostAddress, apiGuid);
				var rm = await RequestModel.CreateFromApiUrl(_baseController.Host, "_api/" + pathInfo);
				var ac = rm.CurrentCommand;

				if (ac.AllowOriginForCheck == null)
					throw new RequestModelException($"'allowOrigin' is required for '{ac.command}' command");

				if (!ac.IsGet())
					throw new RequestModelException($"Method 'get' is required for '{ac.command}' command");

				if (!ValidAllowAddress(ac))
					return;
				if (!ValidHosts(ac))
					return;

				Response.AddHeader("Access-Control-Allow-Origin", ac.AllowOriginForCheck);

				switch (ac.type)
				{
					case CommandType.file:
						if (ac.file == null)
							throw new RequestModelException($"'file' is required for '{ac.command}' command");
						GetFile(ac);
						break;
					case CommandType.clr:
						await ExecuteClrCommand(ac, GetDataToInvokeGet(ac.wrapper, apiGuid, ac.authorize), apiGuid);
						break;
					default:
						throw new NotImplementedException(nameof(DefaultGET));
				}
				await _baseController.ProcessDbEvents(ac);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.ContentType = "text/plain";
				Response.Output.Write(ex.Message);
			}
		}

		void SetIdentityParams(ExpandoObject prms, Boolean authorize)
		{
			Int64? userId = UserId;
			if (userId != null)
				prms.Set("UserId", userId.Value);
			Int32 tenantId = TenantId;
			if (tenantId != 0)
				prms.Set("TenantId", tenantId);

			if (authorize && User.Identity is ClaimsIdentity claims)
			{
				var clEO = new ExpandoObject();
				foreach (var v in claims.Claims)
				{
					clEO.Set(v.Type, v.Value);
				}
				prms.Set("Claims", clEO);
			}
		}

		ExpandoObject GetDataToInvokeGet(String wrapper, Guid apiGuid, Boolean authorize)
		{
			var dataToInvoke = new ExpandoObject();
			SetIdentityParams(dataToInvoke, authorize);
			var qs = Request.QueryString;
			if (qs.HasKeys())
			{
				foreach (var k in qs.AllKeys)
					dataToInvoke.Set(k, qs[k]);
			}
			if (!String.IsNullOrEmpty(wrapper))
			{
				ExpandoObject wrap = new ExpandoObject();
				wrap.Set(wrapper, dataToInvoke);
				dataToInvoke = wrap;
			}
			_logger.LogApi($"getdata: {JsonConvert.SerializeObject(dataToInvoke)}", Request.UserHostAddress, apiGuid);
			return dataToInvoke;
		}

		void GetFile(RequestCommand cmd)
		{
			var appReader = _baseController.Host.ApplicationReader;
			String fullPath = appReader.MakeFullPath(cmd.Path, cmd.file);
			String htmlPath = fullPath + ".html";
			if (!appReader.FileExists(htmlPath))
				throw new FileNotFoundException($"File not found '{fullPath}'");
			Response.ContentType = MimeMapping.GetMimeMapping(htmlPath);
			StringBuilder sb = new StringBuilder(appReader.FileReadAllText(htmlPath));
			String serverUrl = Request.Url.GetLeftPart(UriPartial.Authority);
			sb.Replace("$(ServerUrl)", serverUrl);
			Response.Write(sb.ToString());
		}

		//runAllManagedModulesForAllRequests="true" is required!
		[HttpOptions]
		[ActionName("Default")]
		public async Task DefaultOptions(String pathInfo)
		{
			try
			{
				var rm = await RequestModel.CreateFromApiUrl(_baseController.Host, "_api/" + pathInfo);
				var ac = rm.CurrentCommand;

				if (!ValidAllowAddress(ac))
					return;

				Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
				Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With, Authorization");
				Response.AddHeader("Access-Control-Allow‌​-Credentials", "true");
				Response.AddHeader("Access-Control-Max-Age", "60");
				Response.AddHeader("Access-Control-Allow-Origin", ac.AllowOriginForCheck);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				_logger.LogApiError(ex.Message, Request.UserHostAddress, Guid.NewGuid());

			}
		}

		[HttpPost]
		[ActionName("Default")]
		[Authorize]
		public async Task DefaultPOST(String pathInfo)
		{
			Guid apiGuid = Guid.NewGuid();
			Int32 errorCode = 0;
			try
			{
				_logger.LogApi($"post: {pathInfo}", Request.UserHostAddress, apiGuid);
				var rm = await RequestModel.CreateFromApiUrl(_baseController.Host, "_api/" + pathInfo);
				var ac = rm.CurrentCommand;

				if (!ValidAllowAddress(ac))
					return;

				if (!ValidHosts(ac))
					return;

				if (!ac.IsPost())
					throw new RequestModelException($"Method 'post' is required for '{ac.command}' command");

				errorCode = ac.errorCode;

				if (ac.authorize && !User.Identity.IsAuthenticated)
				{
					_logger.LogApiError("Unauthorized", Request.UserHostAddress, apiGuid);
					Response.StatusCode = 401;
					return;
				}

				Response.ContentType = MimeTypes.Application.Json;
				Response.AddHeader("Access-Control-Allow-Origin", ac.AllowOriginForCheck);

				String json = null;
				Request.InputStream.Seek(0, SeekOrigin.Begin); // ensure
				using (var tr = new StreamReader(Request.InputStream))
				{
					json = tr.ReadToEnd();
					_logger.LogApi($"request: {json}", Request.UserHostAddress, apiGuid);
				}
				ExpandoObject dataToInvoke = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
				if (dataToInvoke == null)
					dataToInvoke = new ExpandoObject();
				if (!String.IsNullOrEmpty(ac.wrapper))
				{
					ExpandoObject wrap = new ExpandoObject();
					wrap.Set(ac.wrapper, dataToInvoke);
					dataToInvoke = wrap;
				}
				SetIdentityParams(dataToInvoke, ac.authorize);
				await ExecuteCommand(ac, dataToInvoke, apiGuid);

				await _baseController.ProcessDbEvents(ac);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				_logger.LogApiError(ex.Message, Request.UserHostAddress, apiGuid);
				_baseController.WriteExceptionStatus(ex, Response, errorCode);
			}
		}

		async Task ExecuteCommand(RequestCommand cmd, ExpandoObject dataToInvoke, Guid apiGuid)
		{
			switch (cmd.type)
			{
				case CommandType.clr:
					await ExecuteClrCommand(cmd, dataToInvoke, apiGuid);
					break;
				case CommandType.sql:
					await ExecuteSqlCommand(cmd, dataToInvoke, apiGuid);
					break;
				case CommandType.javascript:
					await ExecuteJavaScriptCommand(cmd, dataToInvoke, apiGuid);
					break;
			}
		}

		IRequestInfo RequestInfo => new ClrRequestInfo(Request);

		async Task ExecuteClrCommand(RequestCommand cmd, ExpandoObject dataToInvoke, Guid apiGuid)
		{
			TextWriter writer = Response.Output;
			if (String.IsNullOrEmpty(cmd.clrType))
				throw new RequestModelException($"clrType must be specified for command '{cmd.command}'");
			var invoker = new ClrInvoker();
			invoker.SetRequestInfo(RequestInfo);
			Object result = null;
			if (cmd.async)
				result = await invoker.InvokeAsync(cmd.clrType, dataToInvoke, apiGuid);
			else
				result = invoker.Invoke(cmd.clrType, dataToInvoke, apiGuid);
			if (result == null)
				return;
			if (result is String)
			{
				_logger.LogApi($"response: {result}", Request.UserHostAddress, apiGuid);
				writer.Write(result.ToString());
			}
			else if (result is XDocument xDoc)
			{
				Response.ContentType = "text/xml";
				using (var xmlWriter = XmlWriter.Create(writer))
				{
					xDoc.WriteTo(xmlWriter);
				}
			}
			else
			{
				String json = JsonConvert.SerializeObject(result, JsonHelpers.StandardSerializerSettings);
				_logger.LogApi($"response: {json}", Request.UserHostAddress, apiGuid);
				writer.Write(json);
			}
		}

		async Task ExecuteSqlCommand(RequestCommand cmd, ExpandoObject dataToInvoke, Guid apiGuid)
		{
			var jscmd = ServerCommandRegistry.GetCommand(ServiceLocator.Current, CommandType.sql);
			var result = await jscmd.Execute(cmd, dataToInvoke);
			if (result != null)
			{
				Response.ContentType = result.ContentType;
				Response.Write(result.Data);
			}
		}

		async Task ExecuteJavaScriptCommand(RequestCommand cmd, ExpandoObject dataToInvoke, Guid apiGuid)
		{
			var jscmd = ServerCommandRegistry.GetCommand(ServiceLocator.Current, CommandType.javascript);
			var result = await jscmd.Execute(cmd, dataToInvoke);
			if (result != null)
            {
				Response.ContentType = result.ContentType;
				Response.Write(result.Data);
            }
		}
	}
}
