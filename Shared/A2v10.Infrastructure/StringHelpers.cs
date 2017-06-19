using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public static class StringHelpers
	{
		public static String AppendDot(this String This, String append)
		{
			if (String.IsNullOrEmpty(This))
				return append;
			return This + '.' + append;
		}
	}
}
