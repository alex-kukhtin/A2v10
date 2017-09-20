using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public enum DialogSize
    {
        Default = 0,
        Small = 1,
        Medium = Default,
        Large = 2,
    }

    public class Dialog : RootContainer
    {
        public String Title { get; set; }
        public String HelpFile { get; set; }

        public DialogSize Size { get; set; }
        public Length Width { get; set; }

        public UIElementCollection Buttons { get; set; } = new UIElementCollection();

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var dialog = new TagBuilder("div", "modal");
            dialog.MergeAttribute("id", context.RootId);

            SetSize(dialog);

            dialog.RenderStart(context);

            RenderHeader(context);
            RenderLoadIndicator(context);

            var content = new TagBuilder("div", "modal-content");
            content.RenderStart(context);
            RenderChildren(context);
            content.RenderEnd(context);

            RenderFooter(context);

            dialog.RenderEnd(context);
        }



        void SetSize(TagBuilder dialog)
        {
            if ((Size == DialogSize.Default || Size == DialogSize.Medium) && (Width == null))
                return;
            var sb = new StringBuilder("{");
            if (Size == DialogSize.Large)
                sb.Append("cssClass:'large',");
            else if (Size == DialogSize.Small)
                sb.Append("cssClass:'small',");
            if (Width != null)
                sb.Append($"width:'{Width.Value}',");
            sb.RemoveTailComma();
            sb.Append("}");
            dialog.MergeAttribute("v-modal-width", sb.ToString());
        }

        void RenderHeader(RenderContext context)
        {
            var header = new TagBuilder("div", "modal-header");
            header.RenderStart(context);
            var hdr = GetBinding(nameof(Title));
            if ((hdr != null) || (Title != null))
            {
                var span = new TagBuilder("span");
                if (hdr != null)
                    span.MergeAttribute("v-text", hdr.GetPathFormat(context));
                else if (Title != null)
                    span.SetInnerText(Title);
                span.Render(context);
            }
            var close = new TagBuilder("button", "btnclose");
            close.MergeAttribute("@click.prevent", "$modalClose(false)");
            close.SetInnerText("&#x2715;");
            close.Render(context);

            header.RenderEnd(context);
        }

        void RenderLoadIndicator(RenderContext context)
        {
            new TagBuilder("div", "load-indicator")
                .MergeAttribute("v-show", "$isLoading")
                .Render(context);
        }

        void RenderFooter(RenderContext context)
        {
            if (Buttons.Count == 0 && !HasHelp)
                return;
            var footer = new TagBuilder("div", "modal-footer");
            footer.RenderStart(context);

            if (HasHelp)
            {
                //<a class="btn-help"><i class="ico ico-help"></i>Справка</a>
                var ha = new TagBuilder("a", "btn-help");
                // TODO: Help path
                var hbind = GetBinding(nameof(HelpFile));
                if (hbind != null)
                {
                }
                else if (!String.IsNullOrEmpty(HelpFile))
                {
                }
                ha.RenderStart(context);
                new TagBuilder("i", "ico ico-help")
                    .Render(context);
                // TODO: Localize ???
                context.Writer.Write("Help");
                ha.RenderEnd(context);
                new TagBuilder("div", "aligner").Render(context);
            }

            foreach (var b in Buttons)
                b.RenderElement(context);
            footer.RenderEnd(context);
        }

        Boolean HasHelp
        {
            get
            {
                return GetBinding(nameof(HelpFile)) != null || !String.IsNullOrEmpty(HelpFile);
            }
        }
    }
}
