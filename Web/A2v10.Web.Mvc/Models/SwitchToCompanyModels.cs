// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Web.Mvc.Models
{

	public class SwitchToCompanyPostModel
	{
#pragma warning disable IDE1006 // Naming Styles
		public Int64 company { get; set; }
#pragma warning restore IDE1006 // Naming Styles
	}

	public class SwitchToCompanySaveModel
	{
		public Int64 UserId { get; set; }
		public Int64 TenantId { get; set; }
		public Int64 CompanyId { get; set; }
	}
}
