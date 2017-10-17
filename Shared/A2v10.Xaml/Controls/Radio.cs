using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public class Radio : CheckBoxBase
    {
        internal override string ControlType => "radio";

        internal override void MergeCheckBoxAttributes(TagBuilder tag, RenderContext context)
        {
            base.MergeCheckBoxAttributes(tag, context);
            // TODO Merge Checked Value 
            throw new NotImplementedException();
        }
    }
}
