using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IDataModel
	{
		Object Metadata { get; }
		ExpandoObject Root { get; }

		T Eval<T>(String expression, T fallback = default(T));
		void Traverse(Func<Object, Boolean> callback);

        String CreateScript();
	}
}
