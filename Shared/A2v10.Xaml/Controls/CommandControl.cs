using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public abstract class CommandControl : ContentControl
	{
        Object Command { get; set; }

        // TODO: Command Type ???

        internal override void AddAttributes(TagBuilder tag)
        {
            base.AddAttributes(tag);
            var cmd = GetBinding(nameof(Command));
            if (cmd == null)
                return;
            //TODO: merge command to button
        }
    }
}
