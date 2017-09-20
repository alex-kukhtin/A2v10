using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public enum ButtonStyle
    {
        Primary = 0,
        Danger = 1,
        Warning = 2,
        Info = 3,
        Success = 4,
        Green = Success,
        Orange = Warning,
        Red = Danger,
        Cyan = Info,
    }

    public class Button : CommandControl
	{
        public Icon Icon { get; set; }

        public UIElement DropDown { get; set; }

        public ButtonStyle Style { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            bool bHasDropDown = DropDown != null;
            if (bHasDropDown)
            {
                DropDownDirection? dir = (DropDown as DropDownMenu)?.Direction;
                Boolean bDropUp = (dir == DropDownDirection.UpLeft) || (dir == DropDownDirection.UpRight);
                var wrap = new TagBuilder("div", "dropdown")
                    .AddCssClass(bDropUp ? "dir-up" : "dir-down")
                    .MergeAttribute("v-dropdown", String.Empty)
                    .RenderStart(context);
                RenderButton(context, true, bDropUp);
                DropDown.RenderElement(context);
                wrap.RenderEnd(context);
            }
            else
            {
                RenderButton(context, false, false);
            }
        }

        void RenderButton(RenderContext context, Boolean hasDropDown, Boolean bDropUp)
        {
            Boolean hasCommand = GetBindingCommand(nameof(Command)) != null;
            var button = new TagBuilder("button", "btn");
            if (!(Parent is Toolbar))
            {
                button.AddCssClass($"btn-{Style.ToString().ToLowerInvariant()}");
            }
            if (hasDropDown && !hasCommand)
                button.MergeAttribute("toggle", String.Empty);
            MergeAttributes(button, context);
            if (!HasContent && (Icon != Icon.NoIcon))
                button.AddCssClass("btn-icon");
            button.RenderStart(context);
            RenderIcon(context, Icon);
            RenderContent(context);
            if (hasDropDown)
            {
                if (!hasCommand)
                    RenderCaret(context, bDropUp);
            }
            button.RenderEnd(context);
            if (hasDropDown && hasCommand)
            {
                var open = new TagBuilder("button", "btn btn-caret")
                .MergeAttribute("toggle", String.Empty)
                .RenderStart(context);
                RenderCaret(context, bDropUp);
                open.RenderEnd(context);
            }
        }

        void RenderCaret(RenderContext context, Boolean bDropUp)
        {
            new TagBuilder("span", "caret")
                .AddCssClassBool(bDropUp, "up")
                .Render(context);
        }
    }
}
