// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;

namespace A2v10.Web.Identity
{
	public class ModulePermission
	{
		public String Module { get; set;  }
		public Int32 Permissions { get; set; }

		public static String Serialize(IList<ModulePermission> list)
		{
			return String.Join("; ", list.Select(x => $"{x.Module}:{x.Permissions}"));
		}
	}
}
