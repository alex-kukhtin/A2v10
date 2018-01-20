// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Collections.Generic;
using System.Dynamic;
using A2v10.Infrastructure;

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

		public T Eval<T>(String expression)
        {
            T fallback = default(T);
            return (this.Root).Eval<T>(expression, fallback);
		}

        public String CreateScript()
        {
            var sw = new ScriptWriter(this);
            return sw.GetScript();
        }

        public IDictionary<String, Object> GetDynamic()
        {
            return ObjectBuilder.BuildObject(Root as ExpandoObject);
        }

        public Boolean IsReadOnly
        {
            get
            {
                if (System != null && System.HasProperty("ReadOnly"))
                {
                    return System.Get<Boolean>("ReadOnly");
                }
                return false;
            }
        }

        public void Merge(IDataModel src)
        {
            var trgMeta = Metadata as IDictionary<String, ElementMetadata>;
            var srcMeta = src.Metadata as IDictionary<String, ElementMetadata>;
            var trgRoot = Root;
            var srcRoot = src.Root as IDictionary<String, Object>;
            var rootObj = trgMeta["TRoot"];
            var srcSystem = src.System as IDictionary<String, Object>;
            var trgSystem = System;
            foreach (var sm in srcMeta)
            {
                if (sm.Key != "TRoot")
                {
                    if (trgMeta.ContainsKey(sm.Key))
                        trgMeta[sm.Key] = sm.Value;
                    else
                        trgMeta.Add(sm.Key, sm.Value);
                }
                else
                {
                    rootObj.Fields.Append(sm.Value.Fields);
                }
            }
            foreach (var sr in srcRoot)
            {
                if (!trgRoot.AddChecked(sr.Key, sr.Value))
                    throw new DataLoaderException($"DataModel.Merge. Item with '{sr.Key}' already has been added");
            }
            foreach (var sys in srcSystem)
                trgSystem.AddChecked(sys.Key, sys.Value);
        }
    }
}
