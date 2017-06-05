using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
	internal class IdMapper : Dictionary<Tuple<String, Object>, IList<ExpandoObject>>
	{
		public void Add(String typeName, Object id, ExpandoObject value)
		{
			var key = Tuple.Create(typeName, id);
			IList<ExpandoObject> list;
			if (!TryGetValue(key, out list))
			{
				list = new List<ExpandoObject>();
				Add(key, list);
			}
			list.Add(value);
		}
	}
}
