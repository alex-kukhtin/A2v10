using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class BindImpl
    {
        IDictionary<String, BindBase> _bindings;

        public BindBase SetBinding(String name, BindBase bind)
        {
            if (_bindings == null)
                _bindings = new Dictionary<String, BindBase>();
            _bindings.Add(name, bind);
            return bind;
        }

        public void RemoveBinding(String name)
        {
            if (_bindings == null) return;
            if (_bindings.ContainsKey(name))
                _bindings.Remove(name);
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
    }
}
