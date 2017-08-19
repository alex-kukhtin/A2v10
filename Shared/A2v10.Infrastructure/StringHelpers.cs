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

        public static String ToPascalCase(this String s)
        {
            if (String.IsNullOrEmpty(s))
                return null;
            var b = new StringBuilder(s);
            bool bFirst = true;
            for (int i = 0; i < s.Length; i++)
            {
                Char ch = b[i];
                if (bFirst)
                {
                    if (Char.IsLower(ch))
                        b[i] = Char.ToUpper(ch);
                    bFirst = false;
                }
                else if (ch == '.')
                    bFirst = true;
            }
            return b.ToString();
        }
    }
}
