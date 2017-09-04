using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public abstract class CommandControl : ContentControl
	{
        public Command Command { get; set; }

        internal override void MergeAttributes(TagBuilder tag, RenderContext context)
        {
            base.MergeAttributes(tag, context);
            var cmd = GetBindingCommand(nameof(Command));
            if (cmd == null)
                return;
            cmd.MergeCommandAttributes(tag, context);
            tag.MergeAttribute("@click.prevent", cmd.GetCommand(context));
        }
    }
}
