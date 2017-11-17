// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using A2v10.Infrastructure;

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
        public WrapMode Wrap { get; set; }
        public Thickness Absolute { get; set; }

        public String Tip { get; set; }

        internal virtual Boolean SkipRender(RenderContext context)
        {
            return false;
        }

        internal abstract void RenderElement(RenderContext context, Action<TagBuilder> onRender = null);

        [Flags]
        public enum MergeAttrMode
        {
            Visibility = 0x01,
            Margin = 0x02,
            Wrap = 0x04,
            Tip = 0x08,
            All = Visibility | Margin | Wrap | Tip
        }

        internal virtual void MergeAttributes(TagBuilder tag, RenderContext context, MergeAttrMode mode = MergeAttrMode.All)
        {
            if ((mode & MergeAttrMode.Visibility) != 0)
            {
                MergeBindingAttributeBool(tag, context, "v-if", nameof(If), If);
                MergeBindingAttributeBool(tag, context, "v-show", nameof(Show), Show);
                // emulate v-hide
                MergeBindingAttributeBool(tag, context, "v-show", nameof(Hide), Hide, bInvert:true);
            }
            if ((mode & MergeAttrMode.Tip) != 0)
            {
                MergeBindingAttributeString(tag, context, "title", "Tip", Tip);
            }
            if ((mode & MergeAttrMode.Wrap) != 0)
            {
                if (Wrap != WrapMode.Default)
                    tag.AddCssClass(Wrap.ToString().ToKebabCase());
            }
            if ((mode & MergeAttrMode.Margin) != 0)
            {
                if (Margin != null)
                    Margin.MergeStyles("margin", tag);
                if (Padding != null)
                    Padding.MergeStyles("padding", tag);

                if (Absolute != null)
                    Absolute.MergeAbsolute(tag);
            }
        }

        internal void RenderContent(RenderContext context, Object content)
        {
            // if it's a binding, it will be added via MergeAttribute
            if (content == null)
                return;
            if (content is UIElementBase)
                (content as UIElementBase).RenderElement(context);
            else if (content != null)
                context.Writer.Write(content.ToString().Replace("\\n", "\n"));
        }

        internal void RenderIcon(RenderContext context, Icon icon, String addClass = null)
        {
            if (icon == Icon.NoIcon)
                return;
            var iTag = new TagBuilder("i", "ico ico-" + icon.ToString().ToKebabCase());
            iTag.AddCssClass(addClass);
            iTag.Render(context);
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

        internal void MergeBindingAttributeBool(TagBuilder tag, RenderContext context, String attrName, String propName, Boolean? propValue, bool bInvert = false)
        {
            String attrVal = null;
            var attrBind = GetBinding(propName);
            if (attrBind != null)
                attrVal = attrBind.GetPath(context);
            else if (propValue != null)
                attrVal = propValue.ToString().ToLowerInvariant();
            if (attrVal == null)
                return;
            if (bInvert)
                attrVal = "!" + attrVal;
            tag.MergeAttribute(attrName, attrVal);
        }

        internal void MergeValueItemProp(TagBuilder input, RenderContext context, String valueName)
        {
            var valBind = GetBinding(valueName);
            if (valBind == null)
                return;
            // split to path and property
            String path = valBind.GetPath(context);
            var pp = SplitToPathProp(path);
            if (String.IsNullOrEmpty(pp.Path) || String.IsNullOrEmpty(pp.Prop))
                throw new XamlException($"invalid binding for {valueName} '{path}'");
            input.MergeAttribute(":item", pp.Path);
            input.MergeAttribute("prop", pp.Prop);
            if (valBind.DataType != DataType.String)
                input.MergeAttribute("data-type", valBind.DataType.ToString());
        }

        internal void MergeValidateValueItemProp(TagBuilder input, RenderContext context, String valueName)
        {
            var valBind = GetBinding(valueName);
            if (valBind == null)
                return;
            // split to path and property
            String path = valBind.GetPath(context);
            var pp = SplitToPathProp(path);
            if (String.IsNullOrEmpty(pp.Path) || String.IsNullOrEmpty(pp.Prop))
                throw new XamlException($"invalid binding for {valueName} '{path}'");
            input.MergeAttribute(":item-to-validate", pp.Path);
            input.MergeAttribute("prop-to-validate", pp.Prop);
        }

        (String Path, String Prop) SplitToPathProp(String path)
        {
            var result = (Path:"", Prop:"");
            String itemPath = String.Empty;
            String itemProp = String.Empty;
            if (String.IsNullOrEmpty(path))
                return result;
            int ix = path.LastIndexOf('.');
            if (ix != -1)
            {
                result.Prop = path.Substring(ix + 1);
                result.Path = path.Substring(0, ix);
            }
            return result;
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
