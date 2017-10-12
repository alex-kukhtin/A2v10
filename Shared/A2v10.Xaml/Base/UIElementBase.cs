
using A2v10.Infrastructure;
using System;

namespace A2v10.Xaml
{
    public abstract class UIElementBase : XamlElement
    {
        public Boolean? If { get; set; }
        public Boolean? Show { get; set; }
        public Boolean? Hide { get; set; }

        internal Boolean IsInGrid { get; set; } 
        
        public Thickness Margin { get; set; }
        public Thickness Padding { get; set; }

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
            if (Margin != null)
                Margin.MergeStyles("margin", tag);
            if (Padding != null)
                Padding.MergeStyles("padding", tag);
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

        internal void MergeValueItemProp(TagBuilder input, RenderContext context, String valueName)
        {
            var valBind = GetBinding(valueName);
            if (valBind != null)
            {
                // split to path and property
                String path = valBind.GetPath(context);
                String itemPath = String.Empty;
                String itemProp = String.Empty;
                if (String.IsNullOrEmpty(path))
                    return;
                int ix = path.LastIndexOf('.');
                if (ix != -1)
                {
                    itemProp = path.Substring(ix + 1);
                    itemPath = path.Substring(0, ix);
                }
                if (String.IsNullOrEmpty(itemPath) || String.IsNullOrEmpty(itemProp))
                    throw new XamlException($"invalid binding for {valueName} '{path}'");
                input.MergeAttribute(":item", itemPath);
                input.MergeAttribute("prop", itemProp);
            }
        }


        internal void RenderBadge(RenderContext context, String badge)
        {
            var badgeBind = GetBinding("Badge");
            if (badgeBind != null)
            {
                new TagBuilder("span", "badge")
                    .MergeAttribute("v-text", badgeBind.GetPathFormat(context))
                    .Render(context);
            } else if (!String.IsNullOrEmpty(badge)) {
                new TagBuilder("span", "badge")
                    .SetInnerText(badge)
                    .Render(context);
            }
        }

        internal virtual void MergeAlign(TagBuilder input, RenderContext context, TextAlign align)
        {
            var alignProp = GetBinding("Align");
            if (alignProp != null)
                input.MergeAttribute(":align", alignProp.GetPath(context));
            else if (align != TextAlign.Default)
                input.MergeAttribute("align", align.ToString().ToLowerInvariant());
        }
    }
}
