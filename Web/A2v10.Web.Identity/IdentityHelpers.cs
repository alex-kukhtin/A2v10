// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Web.Identity
{
	public static class IdentityHelpers
	{
		public static Boolean IsValidIPAddress(String allow, String real)
		{
			if (String.IsNullOrEmpty(allow) || allow == "*")
				return true; // all
			var arr = allow.Replace(" ", ",").Split(',');
			foreach (var x in arr)
			{
				if (x == real)
					return true;
			}
			return false;
		}
	}
}
