using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Content")]
    public class DataGridColumn : XamlElement
    {
        public Object Content { get; set; }
        public String Header { get; set; }

        public TextAlign Align { get; set; }

        internal void RenderColumn(RenderContext context)
        {
            var column = new TagBuilder("data-grid-column");
            MergeBindingAttribute(column, "header", nameof(Header), Header);
            MergeBindingAttribute(column, "content", nameof(Content), Content);

            var alignProp = GetBinding(nameof(Align));
            if (alignProp != null)
                column.MergeAttribute(":align", alignProp.Path);
            else if (Align != TextAlign.Default)
                column.MergeAttribute("align", Align.ToString().ToLowerInvariant());

            column.RenderStart(context);
            column.RenderEnd(context);
        }

        void MergeBindingAttribute(TagBuilder tag, String attr, String propName, Object propValue)
        {
            var bindProp = GetBinding(propName);
            if (bindProp != null)
                tag.MergeAttribute(":" + attr, bindProp.Path);
            else if (propValue != null)
                tag.MergeAttribute(attr, propValue.ToString());
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
        }
    }

    public class DataGridColumnCollection : List<DataGridColumn>
    {
        public DataGridColumnCollection()
        {

        }
    }

}
