using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class DataGridColumn : XamlElement
    {
        public Object Content { get; set; }
        //TODO: may be UIElement
        public String Header { get; set; }

        public TextAlign Align { get; set; }

        internal void RenderColumn(RenderContext context, Int32 colIndex)
        {
            var column = new TagBuilder("data-grid-column");
            MergeBindingAttribute(context, column, "header", nameof(Header), Header);
            Boolean isTemplate = Content is UIElement;
            String tmlId = null;
            if (!isTemplate)
            {
                // always content without SEMICOLON!
                var bindProp = GetBinding(nameof(Content));
                if (bindProp != null)
                    column.MergeAttribute("content", bindProp.GetPath(context));
                else if (Content != null)
                    column.MergeAttribute("content", Content.ToString());
            }
            var alignProp = GetBinding(nameof(Align));
            if (alignProp != null)
                column.MergeAttribute(":align", alignProp.Path);
            else if (Align != TextAlign.Default)
                column.MergeAttribute("align", Align.ToString().ToLowerInvariant());
            if (isTemplate) {
                tmlId = $"col{colIndex}";
                column.MergeAttribute("id", tmlId);
            }
            column.RenderStart(context);
            column.RenderEnd(context);
            if (isTemplate)
            {
                var templ = new TagBuilder("template");
                templ.MergeAttribute("slot", tmlId);
                templ.MergeAttribute("scope", "cell");
                templ.RenderStart(context);
                using (var cts = new ScopeContext(context, new ScopeElem("Item", "cell.row")))
                {
                    (Content as UIElement).RenderElement(context);
                }
                templ.RenderEnd(context);
            }
        }

        void MergeBindingAttribute(RenderContext context, TagBuilder tag, String attr, String propName, Object propValue)
        {
            var bindProp = GetBinding(propName);
            if (bindProp != null)
                tag.MergeAttribute(":" + attr, bindProp.GetPath(context));
            else if (propValue != null)
                tag.MergeAttribute(attr, propValue.ToString());
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            if (Content is UIElement)
                (Content as UIElement).SetParent(this);
        }
    }

    public class DataGridColumnCollection : List<DataGridColumn>
    {
        public DataGridColumnCollection()
        {

        }
    }

}
