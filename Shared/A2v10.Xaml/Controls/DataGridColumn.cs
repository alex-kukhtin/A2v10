// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Windows.Markup;
using A2v10.Infrastructure;

namespace A2v10.Xaml
{
    public enum ColumnControlType
    {
        Default,
        Editor,
        CheckBox,
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

        public Object Mark { get; set; }

        public Length Width { get; set; }

        public Icon Icon { get; set; }

        public WrapMode Wrap { get; set; }

        Boolean _noPadding;

        internal void RenderColumn(RenderContext context, Int32 colIndex)
        {
            CheckValid();
            var column = new TagBuilder("data-grid-column");
            MergeBindingAttribute(context, column, "header", nameof(Header), Header);
            MergeBoolAttribute(column, context, nameof(Editable), Editable);
            if (_noPadding)
                column.MergeAttribute(":no-padding", "true");
            MergeBoolAttribute(column, context, nameof(Fit), Fit);
            if (Width != null)
                column.MergeAttribute("width", Width.Value);
            var iconBind = GetBinding(nameof(Icon));
            if (iconBind != null)
                column.MergeAttribute("bind-icon", iconBind.Path /*without context*/);
            else if (Icon != Icon.NoIcon)
                column.MergeAttribute("icon", Icon.ToString().ToKebabCase());
            if (Wrap != WrapMode.Default)
                column.MergeAttribute("wrap", Wrap.ToString().ToKebabCase());

            var markBind = GetBinding(nameof(Mark));
            if (markBind != null)
                column.MergeAttribute("mark", markBind.Path /*!without context!*/);
            else if (Mark != null)
                throw new XamlException("The Mark property must be a binding");

            CreateEditable();

            Boolean isTemplate = Content is UIElementBase;
            String tmlId = null;
            if (!isTemplate)
            {
                // always content without a SEMICOLON!
                var bindProp = GetBinding(nameof(Content));
                if (bindProp != null)
                {
                    column.MergeAttribute("content", bindProp.Path /*!without context!*/);
                    if (bindProp.DataType != DataType.String)
                        column.MergeAttribute("data-type", bindProp.DataType.ToString());
                }
                else if (Content != null)
                    throw new XamlException($"The Content property must be a binding ({Content})");
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
                templ.MergeAttribute("slot-scope", "cell");
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

        void CreateEditable()
        {
            switch (ControlType)
            {
                case ColumnControlType.Default:
                case ColumnControlType.Editor:
                    if (!Editable)
                        return;
                    var textBox = new TextBox();
                    textBox.SetBinding("Value", GetBinding("Content"));
                    textBox.SetBinding("Align", GetBinding("Align")); // dynamic
                    textBox.Align = Align; // static
                    Content = textBox;
                    break;
                case ColumnControlType.CheckBox:
                    var checkBox = new CheckBox();
                    checkBox.SetBinding("Value", GetBinding("Content"));
                    if (!Editable)
                        checkBox.Disabled = true;
                    Content = checkBox;
                    break;
            }
        }

        void CheckValid()
        {
            if (Editable && Content != null)
            {
                throw new XamlException("For editable columns the Content must be a binding"); 
            } 
            if ((Content is TextBox) || (Content is Static))
            {
                _noPadding = true;
            }
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
