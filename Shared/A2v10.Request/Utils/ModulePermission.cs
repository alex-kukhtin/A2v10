// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Collections.Generic;

namespace A2v10.Request
{
	public class ModulePermission : Dictionary<String, PermissionBits>
	{
		public String Module { get; set; }
		public Int32 Permissions { get; set; }

		public static String Serialize(IList<ModulePermission> list)
		{
			return String.Join("; ", list.Select(x => $"{x.Module}:{x.Permissions}"));
		}
	}

	public class PermissionSet : Dictionary<String, PermissionBits>
	{
		public void CheckAllow(String actual, Boolean debug)
		{
			if (actual == null)
				return;
			if (Count == 0)
				return;
			var expected = PermissionSet.FromString(actual);

			if (Intersect(expected))
				return;

			if (debug)
			{
				throw new RequestModelException($"UI:Access denied.\nRequired:\t{this}\nActual:\t{expected}");
			}
			else
				throw new RequestModelException("UI:Access denied");
		}

		public override String ToString()
		{
			return String.Join(", ", this.Select(x => $"<b>{x.Key}</b>: [{x.Value.ToString().ToLowerInvariant()}]"));
		}

		Boolean Intersect(PermissionSet other)
		{
			foreach (var p in this)
			{
				if (other.TryGetValue(p.Key, out PermissionBits bits))
				{
					// found in expected
					if ((Int32)(bits & p.Value) != 0)
						return true; // success
				}
			}
			return false;
		}

		static PermissionSet FromString(String text)
		{
			var modules = text.Split(';');
			var result = new PermissionSet();
			foreach (var m in modules)
			{
				var tmp = m.Split(':');
				var module = tmp[0].Trim();
				if (Enum.TryParse<PermissionBits>(tmp[1].Trim(), out PermissionBits perm))
				{
					result.Add(module, perm);
				}
			}
			return result;
		}
	}
}
