using System;
using System.Collections.Generic;
using System.Dynamic;

namespace A2v10.Infrastructure
{
	public interface IDataModel
	{
		Object Metadata { get; }
		ExpandoObject Root { get; }
        ExpandoObject System { get; }

		T Eval<T>(String expression, T fallback = default(T));
		void Traverse(Func<Object, Boolean> callback);
        IDictionary<String, dynamic> GetDynamic();

        String CreateScript();
	}
}
