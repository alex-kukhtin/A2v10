// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System;
using System.Web;

namespace A2v10.Web.Config
{
	public class WebUserStateManager : IUserStateManager
	{
		private readonly IDbContext _dbContext;
		private readonly IApplicationHost _host;

		const String _sessionKey = "_userState_";
		const String _userCompanyKey = "_userCompany_";

		class UserState
		{
			public Boolean ReadOnly { get; set; }
		}

		class UserCompany
		{
			public Int64 CompanyId { get; set; }
		}

		public WebUserStateManager(IApplicationHost host, IDbContext dbContext)
		{
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
			_host = host ?? throw new ArgumentNullException(nameof(host));
		}

		#region IUserStateManager 
		public void SetReadOnly(Boolean readOnly)
		{
			var userState = new UserState() { ReadOnly = readOnly };
			HttpContext.Current.Session[_sessionKey] = userState;
		}
		public Boolean IsReadOnly(Int64 userId)
		{
			if (userId == 0)
				return false;
			if (!(HttpContext.Current.Session[_sessionKey] is UserState userState))
				userState = SetUserState(userId);
			return userState.ReadOnly;
		}

		public void SetUserCompanyId(Int64 CompanyId)
		{
			var userCompany = new UserCompany() { CompanyId = CompanyId };
			HttpContext.Current.Session[_userCompanyKey] = userCompany;
		}
		public Int64 UserCompanyId(Int32 TenantId, Int64 UserId)
		{
			if (UserId == 0)
				throw new InvalidOperationException(nameof(UserCompanyId));
			if (!(HttpContext.Current.Session[_userCompanyKey] is UserCompany userCompany))
				userCompany = SetUserCompany(TenantId, UserId);
			return userCompany.CompanyId;
		}

		#endregion

		UserState SetUserState(Int64 userId)
		{
			var userState = new UserState();
			var dm = _dbContext.LoadModel(_host.CatalogDataSource, "[a2security].[UserStateInfo.Load]", new { UserId = userId });
			userState.ReadOnly = dm.Eval<Boolean>("UserState.ReadOnly");
			HttpContext.Current.Session[_sessionKey] = userState;
			return userState;
		}

		UserCompany SetUserCompany(Int32 TenantId, Int64 UserId)
		{
			var userCompany = new UserCompany();
			var dm = _dbContext.LoadModel(null, "[a2security_tenant].[UserCompany.Load]", new { TenantId, UserId });
			userCompany.CompanyId = dm.Eval<Int64>("UserCompany.Company");
			if (userCompany.CompanyId == 0)
				throw new InvalidOperationException("Procedure 'UserCompany.Load' returned '0'.");
			HttpContext.Current.Session[_userCompanyKey] = userCompany;
			return userCompany;
		}
	}
}
