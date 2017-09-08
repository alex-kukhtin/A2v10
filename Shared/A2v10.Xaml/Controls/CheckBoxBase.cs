using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public abstract class CheckBoxBase : ValuedControl
    {
        internal abstract String ControlType { get; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var tag = new TagBuilder("label", ControlType);
            if (onRender != null)
                onRender(tag);
            tag.RenderStart(context);
            var input = new TagBuilder("input");
            input.MergeAttribute("type", ControlType);
            MergeCheckBoxValue(input, context);
            MergeCheckBoxAttributes(input);
            input.Render(context);
            var span = new TagBuilder("span");
            var lblBind = GetBinding(nameof(Label));
            if (lblBind != null)
            {
                span.MergeAttribute("v-text", lblBind.GetPathFormat(context));
                span.Render(context);
            }
            else if (Label != null)
            {
                span.SetInnerText(Label.ToString());
                span.Render(context);
            }
            tag.RenderEnd(context);
        }

        void MergeCheckBoxValue(TagBuilder input, RenderContext context)
        {
            var valBind = GetBinding(nameof(Value));
            if (valBind != null)
            {
                input.MergeAttribute("v-model", valBind.GetPath(context));
            }
        }

        internal virtual void MergeCheckBoxAttributes(TagBuilder tag)
        {
        }
    }
}
