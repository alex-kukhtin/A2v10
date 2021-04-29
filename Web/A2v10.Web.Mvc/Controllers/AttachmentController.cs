// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Dynamic;

using Microsoft.AspNet.Identity;

using A2v10.Web.Identity;
using A2v10.Infrastructure;
using A2v10.Web.Base;

namespace A2v10.Web.Mvc.Controllers
{
	[Authorize]
	[ExecutingFilter]
	[CheckMobileFilter]
	public class AttachmentController : Controller, IControllerProfiler, IControllerTenant, IControllerLocale
	{
		A2v10.Request.AttachmentController _baseController = new A2v10.Request.AttachmentController();

		public AttachmentController()
		{
			_baseController.Host.StartApplication(false);
		}

		public Int64 UserId => User.Identity.GetUserId<Int64>();
		public Int32 TenantId => User.Identity.GetUserTenantId();
		public Int64 CompanyId => _baseController.UserStateManager.UserCompanyId(TenantId, UserId);
		public String UserSegment => User.Identity.GetUserSegment();
		public IProfiler Profiler => _baseController.Host.Profiler;
		public Boolean SkipRequest(String Url) { return false; }

		[HttpGet]
		public Task Show(String @base, String id, String token)
		{
			return _baseController.Show(@base, id, Response, SetParams, token);
		}

		[HttpGet]
		public Task ShowPrev(String @base, String id, String token)
		{
			return _baseController.ShowPrev(@base, id, Response, SetParams, token);
		}

		[HttpGet]
		public Task Export(String @base, String id, String token)
		{
			return _baseController.Download(@base, id, false, Response, SetParams, token);
		}

		[HttpPost]
		public Task Raw(String @base, String id, String token)
		{
			return _baseController.Download(@base, id, true, Response, SetParams, token);
		}

		[HttpPost]
		public Task Prev(String @base, String id, String token)
		{
			return _baseController.DownloadPrev(@base, id, true, Response, SetParams, token);
		}

		[HttpPost]
		public Task Signature(String Base, String id)
		{
			return _baseController.Signature(Base, id, Response, SetParams);
		}

		[HttpPost]
		public Task Sign(String Base, String id)
		{
			return _baseController.Sign(Base, id, Request, Response, SetParams);
		}

		void SetParams(ExpandoObject prms)
		{
			prms.Set("UserId", UserId);
			prms.Set("TenantId", TenantId);
			if (_baseController.Host.IsMultiCompany)
				prms.Set("CompanyId", CompanyId);
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

		#region IControllerLocale
		public void SetLocale()
		{
			var locale = User.Identity.GetUserLocale();
			_baseController.SetUserLocale(locale);
		}
		#endregion
	}
}
