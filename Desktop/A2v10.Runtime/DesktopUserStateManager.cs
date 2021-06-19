// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Runtime
{
	public class DesktopUserStateManager : IUserStateManager
	{
		private readonly IDbContext _dbContext;
		private readonly IApplicationHost _host;

		private Boolean _readOnly = false;
		private Int64 _companyId = 0;

		public DesktopUserStateManager(IApplicationHost host, IDbContext dbContext)
		{
			_dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
			_host = host ?? throw new ArgumentNullException(nameof(host));
		}

		#region IUserStateManager 
		public Boolean IsReadOnly(Int64 userId)
		{
			if (userId == 0)
				return false;
			return _readOnly;
		}

		public void SetReadOnly(Boolean readOnly)
		{
			_readOnly = readOnly;
		}

		public void SetUserCompanyId(Int64 CompanyId)
		{
			_companyId = CompanyId;
		}

		public Int64 UserCompanyId(Int32 TenantId, Int64 UserId)
		{
			if (!_host.IsMultiCompany)
				return 0;
			if (UserId == 0)
				throw new InvalidOperationException(nameof(UserCompanyId));
			return _companyId;
		}
		#endregion

		public void SetUserPermissions(String permissions)
		{
		}

		public String GetUserPermissions()
		{
			return null;
		}
}
}
