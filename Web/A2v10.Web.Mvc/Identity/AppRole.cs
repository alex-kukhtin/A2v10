// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

using Microsoft.AspNet.Identity;

namespace A2v10.Web.Mvc.Identity
{
	public class AppRole : IRole<Int64>
	{
		#region IRole<Int64>
		public Int64 Id { get; set; }
		public String Name { get; set; }
		#endregion
	}
}
