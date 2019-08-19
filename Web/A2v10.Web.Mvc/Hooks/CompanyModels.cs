// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Web.Mvc.Hooks
{
	class TeanantResult
	{
#pragma warning disable IDE1006 // Naming Styles
		public String status { get; set; }
		public String message { get; set; }
#pragma warning restore IDE1006 // Naming Styles
	}

	public class TenantCompanyInfo
	{
		public Int32 TenantId { get; set; }
		public Int64 UserId { get; set; }
		public String CompanyIds { get; set; }
	}

	public class TenantParams
	{
		public Int32 TenantId { get; set; }
		public Int64 UserId { get; set; }
	}

}
