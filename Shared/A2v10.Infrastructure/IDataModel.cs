using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IDataModel
	{
		Object Metadata { get; }
		Object Root { get; }

		T Eval<T>(String expression, T fallback = default(T));
	}
}
