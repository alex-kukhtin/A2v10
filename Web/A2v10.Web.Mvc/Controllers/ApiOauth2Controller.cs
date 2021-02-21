// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;

using Microsoft.AspNet.Identity;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using A2v10.Request;
using System.Dynamic;
using Newtonsoft.Json;

namespace A2v10.Web.Mvc.Controllers
{
	[AllowAnonymous]
	public class ApiOauth2Controller : Controller, IControllerTenant
	{
		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();
		public String UserSegment => User.Identity.GetUserSegment();

		private readonly BaseController _baseController = new BaseController();
		private readonly ILogger _logger;

		public ApiOauth2Controller()
		{
			_logger = ServiceLocator.Current.GetService<ILogger>();
			_baseController.Host.StartApplication(false);
		}

		[HttpOptions]
		[ActionName("Default")]
		public Task DefaultOptions(String pathInfo)
		{
			return Task.CompletedTask;
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


		Boolean IsAuthenticated()
		{
			if (Request.IsAuthenticated)
				return true;
			Response.ContentType = MimeTypes.Application.Json;
			var eo = new ExpandoObject();
			eo.Set("error", "invalid_grant");
			String json = JsonConvert.SerializeObject(eo, JsonHelpers.StandardSerializerSettings);
			Response.Write(json);
			Response.StatusCode = 401;
			return false;
		}

		public Task Default(String pathInfo)
		{
			if (!IsAuthenticated())
				return Task.CompletedTask;
			StartTenant();
			var eo = new ExpandoObject();
			var q = new ExpandoObject();
			Request.QueryString.CopyTo(q);
			Response.ContentType = MimeTypes.Application.Json;
			eo.Set("userId", UserId);
			eo.Set("tenantId", TenantId);
			eo.Set("segment", UserSegment);
			eo.Set("pathInfo", pathInfo);
			eo.Set("query", q);
			eo.Set("userName", User.Identity.Name);
			String json = JsonConvert.SerializeObject(eo, JsonHelpers.StandardSerializerSettings);
			//_logger.LogApi($"response: {json}", Request.UserHostAddress, apiGuid);
			Response.Write(json);
			return Task.CompletedTask;
		}
	}
}
