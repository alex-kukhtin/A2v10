using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
    public enum DropDownDirection
    {
        DownLeft,
        DownRight,
        UpLeft,
        UpRight
    }

    public class DropDownMenu : Container
    {

        public DropDownDirection Direction { get; set; }

        internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
        {
            var menu = new TagBuilder("div", "dropdown-menu menu");
            menu.MergeAttribute("role", "menu");
            if (Direction != DropDownDirection.DownLeft)
                menu.AddCssClass(Direction.ToString().ToKebabCase());
            menu.RenderStart(context); 
            RenderChildren(context);
            menu.RenderEnd(context);
        }
    }
}
