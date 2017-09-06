
using A2v10.Infrastructure;
using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
    public abstract class UIElementBase : XamlElement
    {

        internal Boolean IsInGrid { get; set; }

        internal virtual Boolean SkipRender(RenderContext context)
        {
            return false;
        }

        internal abstract void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);

        internal void RenderIcon(RenderContext context, Icon icon)
        {
            if (icon == Icon.NoIcon)
                return;
            new TagBuilder("i", "ico ico-" + icon.ToString().ToKebabCase())
                .Render(context);
        }

        internal void MergeBindingAttributeString(TagBuilder tag, RenderContext context, String attrName, String propName, String propValue)
        {
            var attrBind = GetBinding(propName);
            if (attrBind != null)
                tag.MergeAttribute($":{attrName}", attrBind.GetPathFormat(context));
            else
                tag.MergeAttribute(attrName, propValue);
        }

        internal void MergeAttributeInt32(TagBuilder tag, RenderContext context, String attrName, String propName, Int32? propValue)
        {
            var attrBind = GetBinding(propName);
            if (attrBind != null)
                tag.MergeAttribute($":{attrName}", attrBind.GetPath(context));
            else if (propValue != null)
                tag.MergeAttribute($":{attrName}", propValue.ToString());
        }

        internal void MergeCommandAttribute(TagBuilder tag, RenderContext context) {
            var cmd = GetBindingCommand("Command");
            if (cmd == null)
                return;
            cmd.MergeCommandAttributes(tag, context);
            tag.MergeAttribute("@click.prevent", cmd.GetCommand(context));
        }
    }
}
