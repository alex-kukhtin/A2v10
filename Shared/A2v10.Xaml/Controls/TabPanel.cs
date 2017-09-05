using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Xaml
{
    [ContentProperty("Tabs")]
    public class TabPanel : UIElement
    {
        public Object ItemsSource { get; set; }

        public Object Header { get; set; }

        public TabCollection Tabs { get; set; } = new TabCollection();

        static String _replaceScope(String path)
        {
            return path.Replace("tabitem.item.$Index", "tabitem.index").
                     Replace("tabitem.item.$Number", "tabitem.number");
        }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var panel = new TagBuilder("a2-tab-panel", null, IsInGrid);
            if (onRender != null)
                onRender(panel);
            MergeAttributes(panel, context);
            var isBind = GetBinding(nameof(ItemsSource));
            if (isBind != null)
            {
                panel.MergeAttribute(":items", isBind.GetPath(context));
                if (Tabs.Count != 1)
                    throw new XamlException("If ItemsSource is specified, then only one Tab allowed in the collection");
                panel.RenderStart(context);
                var tml = new TagBuilder("template");
                tml.MergeAttribute("slot", "items");
                tml.MergeAttribute("scope", "tabitem");
                tml.RenderStart(context);
                using (var cts = new ScopeContext(context, "tabitem.item", _replaceScope))
                {
                    Tabs[0].RenderTemplate(context);
                }
                tml.RenderEnd(context);
                RenderHeaderTemplate(context);
                RenderHeader(context);
                panel.RenderEnd(context);
            }
            else
            {
                panel.RenderStart(context);
                RenderTabs(context);
                RenderHeader(context);
                panel.RenderEnd(context);
            }
        }

        void RenderHeaderTemplate(RenderContext context)
        {
            var tabHeader = Tabs[0].Header as UIElementBase;
            if (tabHeader == null)
                return;
            var tml = new TagBuilder("template");
            tml.MergeAttribute("slot", "header");
            tml.MergeAttribute("scope", "tabitem");
            tml.RenderStart(context);
            using (var cts = new ScopeContext(context, "tabitem.item", _replaceScope))
            {
                tabHeader.RenderElement(context);
            }
            tml.RenderEnd(context);
        }


        void RenderTabs(RenderContext context)
        {
            foreach (var tab in Tabs)
                tab.RenderElement(context);
        }

        void RenderHeader(RenderContext context)
        {
            var tbind = GetBinding(nameof(Header));
            if (tbind != null)
            {

            }
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var tab in Tabs)
                tab.SetParent(this);
        }
    }
}
