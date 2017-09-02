using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    public enum RunMode
    {
        Client,
        Server,
        ServerUrl
    }

    [ContentProperty("Children")]
    public class CollectionView : Container
    {
        public Object ItemsSource { get; set; }

        public Int32? PageSize { get; set; }

        public RunMode RunAt { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            if (context.IsDialog && RunAt == RunMode.ServerUrl)
                throw new XamlException("RunAt='ServerUrl' is not allowed in dialogs");
            var tag = new TagBuilder("collection-view");
            if (onRender != null)
                onRender(tag);
            var itemsSource = GetBinding(nameof(ItemsSource));
            if (itemsSource != null)
                tag.MergeAttribute(":items-source", itemsSource.Path);

            tag.MergeAttribute("run-at", RunAt.ToString().ToLowerInvariant());

            if (PageSize != null)
                tag.MergeAttribute(":page-size", PageSize.Value.ToString());
            else
                tag.MergeAttribute(":page-size", "$modelInfo.PageSize");

            tag.RenderStart(context);
            var tml = new TagBuilder("template");
            tml.MergeAttribute("scope", "Parent");
            tml.RenderStart(context);
            RenderChildren(context);
            tml.RenderEnd(context);
            tag.RenderEnd(context);
        }
    }
}
