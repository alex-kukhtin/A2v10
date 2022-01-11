// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace BackgroundProcessor
{
    class EmptyUserStateManager : IUserStateManager
    {
        public String GetUserPermissions()
        {
            return null;
        }

        public Boolean IsReadOnly(Int64 userId)
        {
            return false;
        }

        public void SetReadOnly(Boolean readOnly)
        {
        }

        public void SetUserCompanyId(Int64 CompanyId)
        {
        }

        public void SetUserPermissions(string permissions)
        {
        }

        public Int64 UserCompanyId(Int32 TenantId, Int64 UserId)
        {
            return 0;
        }
    }
}
