using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public enum ColumnControlType
    {
        Default,
        Editor,
        Validator
    }

    [ContentProperty("Content")]
    public class DataGridColumn : XamlElement
    {
        public Object Content { get; set; }
        //TODO: may be UIElement
        public String Header { get; set; }

        public TextAlign Align { get; set; }

        public Boolean Fit { get; set; }

        public Boolean Editable { get; set; }

        public Command Command { get; set; }

        public ColumnControlType ControlType { get; set; }

        internal void RenderColumn(RenderContext context, Int32 colIndex)
        {
            var column = new TagBuilder("data-grid-column");
            MergeBindingAttribute(context, column, "header", nameof(Header), Header);
            MergeBoolAttribute(column, context, nameof(Editable), Editable);
            MergeBoolAttribute(column, context, nameof(Fit), Fit);
            Boolean isTemplate = Content is UIElementBase;
            String tmlId = null;
            if (!isTemplate)
            {
                // always content without SEMICOLON!
                var bindProp = GetBinding(nameof(Content));
                if (bindProp != null)
                {
                    column.MergeAttribute("content", bindProp.Path /*!without context!*/);
                    if (bindProp.DataType != DataType.String)
                        column.MergeAttribute("data-type", bindProp.DataType.ToString());
                }
                else if (Content != null)
                    column.MergeAttribute("content", Content.ToString());
            }

            Bind ctBind = GetBinding(nameof(ControlType));
            if (ctBind != null)
                column.MergeAttribute(":control-type", ctBind.Path /*!without context!*/);
            else if (ControlType != ColumnControlType.Default)
                column.MergeAttribute("control-type", ControlType.ToString().ToLowerInvariant());

            var alignProp = GetBinding(nameof(Align));
            if (alignProp != null)
                column.MergeAttribute(":align", alignProp.Path /*!without context!*/);
            else if (Align != TextAlign.Default)
                column.MergeAttribute("align", Align.ToString().ToLowerInvariant());

            if (isTemplate) {
                tmlId = $"col{colIndex}";
                column.MergeAttribute("id", tmlId);
            }

            var cmdBind = GetBindingCommand(nameof(Command));
            if (cmdBind != null)
                column.MergeAttribute(":command", cmdBind.GetCommand(context, true));
            column.RenderStart(context);
            column.RenderEnd(context);
            if (isTemplate)
            {
                var templ = new TagBuilder("template");
                templ.MergeAttribute("slot", tmlId);
                templ.MergeAttribute("scope", "cell");
                templ.RenderStart(context);
                using (var ctx = new ScopeContext(context, "cell.row"))
                {
                    (Content as UIElementBase).RenderElement(context);

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
            if (Content is XamlElement)
                (Content as XamlElement).SetParent(this);
        }
    }

    public class DataGridColumnCollection : List<DataGridColumn>
    {
        public DataGridColumnCollection()
        {

        }
    }

}
