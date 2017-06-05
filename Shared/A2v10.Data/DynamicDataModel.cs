using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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
			//TODO: move to HELPER
			if (expression == null)
				return fallback;
			Object currentContext = this.Root;
			foreach (var exp in expression.Split('.'))
			{
				if (currentContext == null)
					return fallback;
				String prop = exp.Trim();
				var d = currentContext as IDictionary<String, Object>;
				if (prop.Contains("["))
				{
					var match = new Regex(@"(\w+)\[(\d+)\]{1}").Match(prop);
					prop = match.Groups[1].Value;
					if ((d != null) && d.ContainsKey(prop))
					{
						var x = d[prop] as IList<ExpandoObject>;
						currentContext = x[Int32.Parse(match.Groups[2].Value)];
					}
					else
						return fallback;
				}
				else
				{
					if ((d != null) && d.ContainsKey(prop))
						currentContext = d[prop];
					else
						return fallback;
				}
			}
			if (currentContext == null)
				return fallback;
			if (currentContext is T)
				return (T)currentContext;
			return fallback;
		}

	}
}
