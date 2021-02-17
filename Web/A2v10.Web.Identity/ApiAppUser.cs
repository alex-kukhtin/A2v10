// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Web.Identity
{
	public class ApiAppUser
	{
		public Int64 Id { get; set; }
		public Int32 Tenant { get; set; }
		public String Name { get; set; }
		public String Segment { get; set; }
		public String AllowIP { get; set; }
		public String ClientId { get; set; }
	}
}
