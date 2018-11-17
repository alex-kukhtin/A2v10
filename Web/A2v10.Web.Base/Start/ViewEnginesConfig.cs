// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.Web.Mvc;

namespace A2v10.Web.Base.Start
{
	public class ViewEnginesConfig
	{
		public static void SetupViewEngines(ViewEngineCollection engines)
		{
			if (engines[0] is WebFormViewEngine)
				engines.RemoveAt(0); // WebForm is not used

			foreach (var eng in engines)
				eng.SetupEngineForSite();
		}
	}
}
