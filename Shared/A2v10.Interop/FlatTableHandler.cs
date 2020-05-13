// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Dynamic;
using A2v10.Data.Interfaces;

namespace A2v10.Interop
{
	internal class FlatTableHandler : ITableDescription
	{
		private readonly List<Object> _list;

		public FlatTableHandler()
		{
			_list = new List<Object>();
		}

		public ExpandoObject NewRow()
		{
			var nr = new ExpandoObject();
			_list.Add(nr);
			return nr;
		}

		public void SetValue(ExpandoObject obj, String propName, Object value)
		{
			var d = obj as IDictionary<String, Object>;
			if (d.ContainsKey(propName))
				d[propName] = value;
			else
				d.Add(propName, value);
		}

		public ExpandoObject ToObject()
		{
			var eo = new ExpandoObject();
			var d = eo as IDictionary<String, Object>;
			d.Add("Rows", _list);
			return eo;
		}
	}
}
