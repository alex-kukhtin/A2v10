using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Data
{
    public class DynamicDataModel : IDataModel
    {
		public Object Metadata { get; }
		public Object Root { get; }

		internal DynamicDataModel(Object metadata, Object root)
		{
			Metadata = metadata;
			Root = root;
		}


		public T Eval<T>(String expression, T fallback = default(T))
		{
			if (expression == null)
				return fallback;
			Object currentContext = this.Root;
			foreach (var exp in expression.Split('.'))
			{
				if (currentContext == null)
					return fallback;
				String prop = exp.Trim();
				var d = currentContext as IDictionary<String, Object>;
				if ((d != null) && d.ContainsKey(prop))
					currentContext = d[prop];
				else
					return fallback;
			}
			if (currentContext == null)
				return fallback;
			if (currentContext is T)
				return (T)currentContext;
			return fallback;
		}

	}
}
