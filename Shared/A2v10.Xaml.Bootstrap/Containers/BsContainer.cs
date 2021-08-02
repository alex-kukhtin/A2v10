
using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Bootstrap
{
	[ContentProperty("Children")]
	public abstract class BsContainer : BsElement
	{
		public BsElementCollection Children { get; set; } = new BsElementCollection();

		public abstract String ContainerClass { get; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			var tag = new TagBuilder("div", ContainerClass);
			onRender?.Invoke(tag);
			tag.RenderStart(context);
			RenderChildren(context);
			tag.RenderEnd(context);
		}

		public virtual void RenderChildren(RenderContext context)
		{
			foreach (var c in Children)
				c.RenderElement(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var c in Children)
				c.SetParent(this);
		}
	}
}
