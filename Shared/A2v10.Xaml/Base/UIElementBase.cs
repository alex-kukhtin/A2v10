
using A2v10.Infrastructure;
using System;
using System.ComponentModel;
using System.Globalization;

namespace A2v10.Xaml
{
    public abstract class UIElementBase : XamlElement
    {
        public Boolean? If { get; set; }
        public Boolean? Show { get; set; }
        public Boolean? Hide { get; set; }

        internal Boolean IsInGrid { get; set; }     

        internal virtual Boolean SkipRender(RenderContext context)
        {
            return false;
        }

        internal abstract void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);

        internal virtual void MergeAttributes(TagBuilder tag, RenderContext context)
        {
            MergeBindingAttributeBool(tag, context, "v-if", nameof(If), If);
            MergeBindingAttributeBool(tag, context, "v-show", nameof(Show), Show);
            MergeBindingAttributeBool(tag, context, "v-hide", nameof(Hide), Hide);
        }

        internal void RenderContent(RenderContext context, Object content)
        {
            // if it's a binding, it will be added via MergeAttribute
            if (content == null)
                return;
            if (content is UIElementBase)
                (content as UIElementBase).RenderElement(context);
            else if (content != null)
                context.Writer.Write(content.ToString());
        }

        internal void RenderIcon(RenderContext context, Icon icon)
        {
            if (icon == Icon.NoIcon)
                return;
            new TagBuilder("i", "ico ico-" + icon.ToString().ToKebabCase())
                .Render(context);
            context.RenderSpace(); // after icon - always
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

        internal void MergeBindingAttributeBool(TagBuilder tag, RenderContext context, String attrName, String propName, Boolean? propValue)
        {
            var attrBind = GetBinding(propName);
            if (attrBind != null)
                tag.MergeAttribute(attrName, attrBind.GetPath(context));
            else if (propValue != null)
                tag.MergeAttribute(attrName, propValue.ToString().ToLowerInvariant());
        }
    }
}
