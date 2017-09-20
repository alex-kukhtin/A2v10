using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public enum AutoSelectMode
    {
        None,
        FirstItem
    }

    public class TreeViewItem : UIElementBase
    {
        public Object ItemsSource { get; set; }

        public Icon Icon { get; set; }

        public String Label { get; set; }

        public String Tip { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            throw new NotImplementedException();
        }

        internal void AppendJsValues(StringBuilder sb, RenderContext context)
        {
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
                sb.Append($"subitems: '{isBind.GetPath(context)}',");
            var labelBind = GetBinding(nameof(Label));
            if (labelBind != null)
                sb.Append($"label: '{labelBind.GetPath(context)}',");
            var tipBind = GetBinding(nameof(Tip));
            if (tipBind != null)
                sb.Append($"title: '{tipBind.GetPath(context)}',");
        }
    }

    public class TreeViewItemCollection : List<TreeViewItem>
    {
    }

    [ContentProperty("Children")]
    public class TreeView : Control
    {
        public Object ItemsSource { get; set; }

        public Boolean FolderSelect { get; set; }
        public Boolean WrapLabel { get; set; }

        public Icon IconFolder { get; set; }
        public Icon IconItem { get; set; }

        public AutoSelectMode AutoSelect { get; set; }

        public TreeViewItemCollection Children { get; set; } = new TreeViewItemCollection();

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var cont = new TagBuilder("tree-view", "tree-view", IsInGrid);
            MergeAttributes(cont, context);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                cont.MergeAttribute(":items", isBind.GetPath(context));
                cont.MergeAttribute(":expand", "$expand"); // in BaseController
                if (Children.Count != 1)
                    throw new XamlException("Only one TreeViewItem element is allowed for dynamic TreeView");
                var ch = Children[0];
                cont.MergeAttribute(":options", GetOptions(context, ch));
            }
            if (AutoSelect != AutoSelectMode.None)
                cont.MergeAttribute("auto-select", AutoSelect.ToString().ToKebabCase());
            cont.RenderStart(context);
            cont.RenderEnd(context);
        }

        String GetOptions(RenderContext context, TreeViewItem childElem)
        {
            var sb = new StringBuilder("{");
            sb.Append("isDynamic: true,");
            var fsBind = GetBinding(nameof(FolderSelect));
            if (fsBind != null)
                sb.Append($"folderSelect: {fsBind.GetPath(context)},");
            else if (FolderSelect)
                sb.Append("folderSelect: true,");
            var wlBind = GetBinding(nameof(WrapLabel));
            if (wlBind != null)
                sb.Append($"wrapLabel: {wlBind.GetPath(context)},");
            else if (WrapLabel)
                sb.Append("wrapLabel: true,");

            if (IconFolder != Icon.NoIcon && IconItem != Icon.NoIcon)
            {
                sb.Append("hasIcon: true,");
                sb.Append($"staticIcons: ['{IconFolder.ToString().ToKebabCase()}', '{IconItem.ToString().ToKebabCase()}'],");
            }

            childElem.AppendJsValues(sb, context);
            sb.RemoveTailComma(); // tail comma
            sb.Append("}");
            return sb.ToString();
        }
    }
}
