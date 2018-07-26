// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.


using System;
using System.Web.Mvc;
using System.Threading.Tasks;
using System.IO;
using System.Dynamic;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Request;
using A2v10.Interop;
using Microsoft.AspNet.Identity;
using System.Security.Claims;
using System.Security.Principal;
using A2v10.Infrastructure;

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

		public Int32? TenantId
		{
			get
			{
				IIdentity identity = User.Identity;
				if (identity == null)
					return null;
				if (!(identity is ClaimsIdentity user))
					return null;
				var value = user.FindFirstValue("TenantId");
				if (Int32.TryParse(value, out Int32 tenantId))
					return tenantId;
				return null;
			}
		}



		[HttpPost]
		public async Task Default(String pathInfo)
		{
			try
			{
				_logger.LogApi($"call: {pathInfo}");
				var rm = await RequestModel.CreateFromApiUrl(_baseController.Host, "_api/" + pathInfo);
				var ac = rm.CurrentCommand;
				Response.ContentType = "application/json";

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
				Int64? userId = UserId;
				if (userId != null)
					dataToInvoke.Set("UserId", userId.Value);
				Int32? tenantId = TenantId;
				if (tenantId != null)
					dataToInvoke.Set("TenantId", tenantId.Value);
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
			else
				writer.Write(JsonConvert.SerializeObject(result, BaseController.StandardSerializerSettings));
		}
	}
}
