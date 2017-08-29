using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Xaml
{
	public class UIElement: UIElementBase
	{
		public Boolean? Bold { get; set; }
		public Boolean? Italic { get; set; }
        public String Tip { get; set; }

		internal virtual void AddAttributes(TagBuilder tag, RenderContext context)
		{
            // TODO: Bold/Italic Binding
			if (Bold.HasValue)
				tag.AddCssClass(Bold.Value ? "bold" : "no-bold");
			if (Italic.HasValue)
				tag.AddCssClass(Italic.Value ? "italic" : "no-italic");
            SetBindingAttributeString(tag, "title", "Tip", Tip);
		}


        void SetBindingAttributeString(TagBuilder tag, String attrName, String propName, String propValue)
        {
            var attrBind = GetBinding(propName);
            if (attrBind != null)
                tag.MergeAttribute($":{attrName}", attrBind.Path);
            else
                tag.MergeAttribute(attrName, propValue);
        }


        internal void RenderIcon(RenderContext context, Icon icon)
        {
            if (icon == Icon.NoIcon)
                return;
            new TagBuilder("i", "ico ico-" + icon.ToString().ToKebabCase())
                .Render(context);
        }

    }
}
