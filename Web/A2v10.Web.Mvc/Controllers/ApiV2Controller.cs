﻿// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;

using Microsoft.AspNet.Identity;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using A2v10.Request.Api;
using A2v10.Data.Interfaces;
using A2v10.Web.Base;

/*TODO:
 * UpdateModel - проверить
 * AllowOrigin
 */

namespace A2v10.Web.Mvc.Controllers
{
	[AuthorizeApi]
	public class ApiV2Controller : Controller, IControllerTenant
	{
		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();
		public String UserSegment => User.Identity.GetUserSegment();

		//private readonly BaseController _baseController = new BaseController();
		private readonly IApplicationHost _host;
		private readonly ILogger _logger;
		private readonly IDbContext _dbContext;

		public ApiV2Controller()
		{
			_logger = ServiceLocator.Current.GetService<ILogger>();
			_host = ServiceLocator.Current.GetService<IApplicationHost>();
			_dbContext = ServiceLocator.Current.GetService<IDbContext>();
			_host.StartApplication(false);
			_host.Profiler.Enabled = false;
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
			_host.TenantId = TenantId;
			_host.UserId = UserId;
			_host.UserSegment = UserSegment;
		}
		#endregion

		public async Task Default(String pathInfo)
		{
			StartTenant();

			var request = ApiRequest.FromHttpRequest(Request, pathInfo, (rq) =>
			{
				rq.UserId = UserId;
				rq.Segment = UserSegment;
				rq.ClientId = User.Identity.GetUserClaim("ClientId");
				if (_host.IsMultiTenant)
					rq.TenantId = TenantId;
				rq.Config = _host.GetAppSettingsObject("apiV2Config");
			});


			var apiService = new ApiDataService(_host, _dbContext);
			var response = await apiService.ProcessRequest(request);

			Response.ContentType = response.ContentType;
			Response.Write(response.Body);
		}
	}
}
