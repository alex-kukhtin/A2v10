// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.Web.Mvc;

namespace A2v10.Web.Mvc.Start
{
	public class FilterConfig
	{
		public static void RegisterGlobalFilters(GlobalFilterCollection filters)
		{
			filters.Add(new HandleErrorAttribute());
		}
	}
}
