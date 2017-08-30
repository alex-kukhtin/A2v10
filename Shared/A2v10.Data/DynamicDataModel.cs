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
		public ExpandoObject Root { get; }
        public ExpandoObject System { get; }

		internal DynamicDataModel(Object metadata, ExpandoObject root, ExpandoObject system)
		{
			Metadata = metadata;
			Root = root;
            System = system;
		}

		public void Traverse(Func<Object, Boolean> callback)
		{
			var root = Root;
			if (root == null)
				return;
			TraverseImpl(root, callback);
		}

		bool TraverseImpl(ExpandoObject root, Func<Object, Boolean> callback)
		{
			if (root == null)
				return false;
			if (!callback(root))
				return false;
			foreach (var r in root)
			{
				if (r.Value is IList<ExpandoObject>)
				{
					var list = r.Value as IList<ExpandoObject>;
					foreach (var l in list)
					{
						if (!TraverseImpl(l, callback))
							return false;
					}
				}
				else if (r.Value is ExpandoObject)
				{
					if (!callback(r.Value))
						return false;
				}
			}
			return true;
		}

		public T Eval<T>(String expression, T fallback = default(T))
		{
			return (this.Root).Eval<T>(expression, fallback);
		}

        public String CreateScript()
        {
            var sw = new ScriptWriter(this);
            return sw.GetScript();
        }
    }
}
