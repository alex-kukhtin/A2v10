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

        public TabCollection Tabs { get; set; } = new TabCollection();

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
                using (var cts = new ScopeContext(context, "tabitem.item"))
                {
                    Tabs[0].RenderTemplate(context);
                }
                tml.RenderEnd(context);
                panel.RenderEnd(context);
            }
            else
            {
                panel.RenderStart(context);
                RenderTabs(context);
                panel.RenderEnd(context);
            }
        }



        void RenderTabs(RenderContext context)
        {
            foreach (var tab in Tabs)
                tab.RenderElement(context);
        }

        protected override void OnEndInit()
        {
            base.OnEndInit();
            foreach (var tab in Tabs)
                tab.SetParent(this);
        }
    }
}
