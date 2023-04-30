// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Javascript;

public class ScriptUser
{
#pragma warning disable IDE1006 // Naming Styles
	public Int32 tenantId { get; }
	public Int64 userId { get; }	
	public String segment { get; }
#pragma warning restore IDE1006 // Naming Styles
	public ScriptUser(IApplicationHost host)
	{
		tenantId = host.TenantId ?? 1;
		userId = host.UserId ?? 0;
		segment = host.UserSegment ?? String.Empty;	
	}
}
