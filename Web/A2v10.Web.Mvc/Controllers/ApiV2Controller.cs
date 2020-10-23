// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;

using Microsoft.AspNet.Identity;

using A2v10.Infrastructure;
using A2v10.Web.Identity;
using A2v10.Request;

namespace A2v10.Web.Mvc.Controllers
{
	[Authorize]
	public class ApiV2Controller : Controller, IControllerTenant
	{

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();
		public String UserSegment => User.Identity.GetUserSegment();

		private readonly BaseController _baseController = new BaseController();
		private readonly ILogger _logger;

		public ApiV2Controller()
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
	}
}
