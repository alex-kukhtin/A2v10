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

		class UserState
		{
			public Boolean ReadOnly { get; set; }
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
			if (!(HttpContext.Current.Session[_sessionKey] is UserState userState))
				userState = SetUserState(userId);
			return userState.ReadOnly;
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
	}
}
