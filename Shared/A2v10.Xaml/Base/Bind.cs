using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	public class Bind : BindBase
	{

		public String Path { get; set; }

		public Bind()
		{

		}
		public Bind(String path)
		{
			Path = path;
		}

        internal String GetPath(RenderContext context)
        {
            if (Path == null)
                return null;
            return context.GetNormalizedPath(Path);
        }
	}
}
