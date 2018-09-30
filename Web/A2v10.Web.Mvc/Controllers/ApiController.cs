// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


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

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	public class ApiController : Controller
	{
		A2v10.Request.BaseController _baseController = new BaseController();
		ILogger _logger;

		public ApiController()
		{
			_logger = ServiceLocator.Current.GetService<ILogger>();
		}

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

		[HttpGet]
		[ActionName("Default")]
		public async Task DefaultGET(String pathInfo)
		{
			try
			{
				_logger.LogApi($"get: {pathInfo}");
				var rm = await RequestModel.CreateFromApiUrl(_baseController.Host, "_api/" + pathInfo);
				var ac = rm.CurrentCommand;

				if (ac.allowOrigin == null)
					throw new RequestModelException($"'allowOrigin' is required for '{ac.command}' command");

				Response.AddHeader("Access-Control-Allow-Origin", ac.allowOrigin);

				switch (ac.type)
				{
					case CommandType.file:
						if (ac.file == null)
							throw new RequestModelException($"'file' is required for '{ac.command}' command");
						GetFile(ac);
						break;
					case CommandType.clr:
						await ExecuteClrCommand(ac, GetDataToInvokeGet(ac.wrapper));
						break;
					default:
						throw new NotImplementedException();
				}
			} catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				Response.ContentType = "text/plain";
				Response.Output.Write(ex.Message);
			}
		}

		void SetIdentityParams(ExpandoObject prms)
		{
			Int64? userId = UserId;
			if (userId != null)
				prms.Set("UserId", userId.Value);
			Int32 tenantId = TenantId;
			if (tenantId != 0)
				prms.Set("TenantId", tenantId);
		}

		ExpandoObject GetDataToInvokeGet(String wrapper)
		{
			var dataToInvoke = new ExpandoObject();
			SetIdentityParams(dataToInvoke);
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
			_logger.LogApi($"getdata: {JsonConvert.SerializeObject(dataToInvoke)}");
			return dataToInvoke;
		}

		void GetFile(RequestCommand cmd)
		{
			String fullPath = _baseController.Host.MakeFullPath(false, cmd.Path, cmd.file);
			String htmlPath = fullPath + ".html";
			if (!System.IO.File.Exists(htmlPath))
				throw new FileNotFoundException($"File not found '{fullPath}'");
			Response.ContentType = MimeMapping.GetMimeMapping(htmlPath);
			StringBuilder sb = new StringBuilder(System.IO.File.ReadAllText(htmlPath));
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

				if (!String.IsNullOrEmpty(ac.allowAddress))
				{
					if (!ac.allowAddress.Contains(Request.UserHostAddress))
						return;
				}

				Response.AddHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
				Response.AddHeader("Access-Control-Allow-Headers", "Content-Type, Accept, X-Requested-With");
				Response.AddHeader("Access-Control-Allow‌​-Credentials", "true");
				Response.AddHeader("Access-Control-Max-Age", "60");
				Response.AddHeader("Access-Control-Allow-Origin", ac.allowOrigin);
			}
			catch (Exception ex)
			{
				if (ex.InnerException != null)
					ex = ex.InnerException;
				_logger.LogApiError(ex.Message);

			}
		}

		[HttpPost]
		[ActionName("Default")]
		public async Task DefaultPOST(String pathInfo)
		{
			try
			{
				_logger.LogApi($"post: {pathInfo}");
				var rm = await RequestModel.CreateFromApiUrl(_baseController.Host, "_api/" + pathInfo);
				var ac = rm.CurrentCommand;
				Response.ContentType = "application/json";
				Response.AddHeader("Access-Control-Allow-Origin", ac.allowOrigin);

				String json = null;
				Request.InputStream.Seek(0, SeekOrigin.Begin); // ensure
				using (var tr = new StreamReader(Request.InputStream))
				{
					json = tr.ReadToEnd();
					_logger.LogApi($"request: {json}");
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
				SetIdentityParams(dataToInvoke);
				await ExecuteCommand(ac, dataToInvoke);
			}
			catch (Exception ex)
			{
				// TODO log api
				if (ex.InnerException != null)
					ex = ex.InnerException;
				_logger.LogApiError(ex.Message);
				_baseController.WriteExceptionStatus(ex, Response);
			}
		}

		async Task ExecuteCommand(RequestCommand cmd, ExpandoObject dataToInvoke)
		{
			switch (cmd.type)
			{
				case CommandType.clr:
					await ExecuteClrCommand(cmd, dataToInvoke);
					break;
			}
		}

		async Task ExecuteClrCommand(RequestCommand cmd, ExpandoObject dataToInvoke)
		{
			TextWriter writer = Response.Output;
			if (String.IsNullOrEmpty(cmd.clrType))
				throw new RequestModelException($"clrType must be specified for command '{cmd.command}'");
			var invoker = new ClrInvoker();
			Object result = null;
			if (cmd.async)
				result = await invoker.InvokeAsync(cmd.clrType, dataToInvoke);
			else
				result = invoker.Invoke(cmd.clrType, dataToInvoke);
			if (result == null)
				return;
			if (result is String)
				writer.Write(result.ToString());
			else if (result is XDocument xDoc)
			{
				Response.ContentType = "text/xml";
				using (var xmlWriter = XmlWriter.Create(writer))
				{
					xDoc.WriteTo(xmlWriter);
				}
			}
			else
				writer.Write(JsonConvert.SerializeObject(result, BaseController.StandardSerializerSettings));
		}
	}
}
