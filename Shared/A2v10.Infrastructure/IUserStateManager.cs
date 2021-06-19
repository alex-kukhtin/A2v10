// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IUserStateManager
	{
		void SetReadOnly(Boolean readOnly);
		Boolean IsReadOnly(Int64 userId);

		void SetUserCompanyId(Int64 CompanyId);
		Int64 UserCompanyId(Int32 TenantId, Int64 UserId);

		void SetUserPermissions(String permissions);
		String GetUserPermissions();
	}
}
