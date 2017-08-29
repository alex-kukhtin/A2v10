
using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace A2v10.Xaml
{
	public class XamlElement : ISupportInitialize
	{
		IDictionary<String, BindBase> _bindings;

		internal XamlElement Parent { get; private set; }

		protected virtual void OnEndInit()
		{
		}

		internal void SetParent(XamlElement parent)
		{
			Parent = parent;
		}

		public BindBase SetBinding(String name, BindBase bind)
		{
			if (_bindings == null)
				_bindings = new Dictionary<String, BindBase>();
			_bindings.Add(name, bind);
			return bind;
		}

        public Bind GetBinding(String name)
        {
            if (_bindings == null)
                return null;
            BindBase bind = null;
            if (_bindings.TryGetValue(name, out bind))
            {
                if (bind is Bind)
                    return bind as Bind;
                throw new XamlException($"Binding '{name}' must be a Bind");
            }
            return null;
        }

        public BindCmd GetBindingCommand(String name)
        {
            if (_bindings == null)
                return null;
            BindBase bind = null;
            if (_bindings.TryGetValue(name, out bind))
            {
                if (bind is BindCmd)
                    return bind as BindCmd;
                throw new XamlException($"Binding '{name}' must be a BindCmd");
            }
            return null;
        }

        internal void MergeBoolAttribute(TagBuilder tag, String propName, Boolean value)
        {
            var attrBind = GetBinding(propName);
            // bool attrs always with ':'
            String attrName = $":{propName.ToLowerInvariant()}";
            if (attrBind != null)
                tag.MergeAttribute(attrName, attrBind.Path);
            else if (value)
                tag.MergeAttribute(attrName, value.ToString().ToLowerInvariant());

        }

		#region ISupportInitialize
		public void BeginInit()
		{
			// do nothing
		}

		public void EndInit()
		{
			OnEndInit();
		}
		#endregion
	}
}
