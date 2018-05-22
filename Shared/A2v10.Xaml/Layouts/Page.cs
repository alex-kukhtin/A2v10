// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class Page : RootContainer
	{

		public UIElement Toolbar { get; set; }
		public UIElement Taskpad { get; set; }
		public Pager Pager { get; set; }
		public String Title { get; set; }

		public BackgroundStyle Background { get; set; }
		public CollectionView CollectionView { get; set; }

		internal override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			TagBuilder page = null;
			Boolean isGridPage = (Toolbar != null) || (Taskpad != null) || (Pager != null);

			// render page OR colleciton view

			void addGridAction(TagBuilder tag)
			{
				if (!isGridPage)
					return;
				tag.AddCssClass("page-grid");
				if (Taskpad != null)
				{
					if (Taskpad is Taskpad tp && tp.Width != null)
					{
						tag.MergeStyle("grid-template-columns", $"1fr {tp.Width.Value}");
					}
				}
			}

			if (CollectionView != null)
			{
				CollectionView.RenderStart(context, (tag) =>
				{
					tag.AddCssClass("page").AddCssClass("absolute");
					addGridAction(tag);
					AddAttributes(tag);
					tag.MergeAttribute("id", context.RootId);
				});
			}
			else
			{
				page = new TagBuilder("div", "page absolute");
				page.MergeAttribute("id", context.RootId);
				addGridAction(page);
				AddAttributes(page);
				page.RenderStart(context);
			}


			RenderTitle(context);

			if (isGridPage)
			{
				Toolbar?.RenderElement(context, (tag) => tag.AddCssClass("page-toolbar"));
				Taskpad?.RenderElement(context, (tag) => tag.AddCssClass("page-taskpad"));
				Pager?.RenderElement(context, (tag) => tag.AddCssClass("page-pager"));
				var content = new TagBuilder("div", "page-content").RenderStart(context);
				RenderChildren(context);
				content.RenderEnd(context);
			}
			else
				RenderChildren(context);

			if (CollectionView != null)
				CollectionView.RenderEnd(context);
			else
			{
				if (page == null)
					throw new InvalidProgramException();
				page.RenderEnd(context);
			}
		}

		void AddAttributes(TagBuilder tag)
		{
			if (Background != BackgroundStyle.None)
				tag.AddCssClass("background-" + Background.ToString().ToKebabCase());
			tag.AddCssClass(CssClass);
		}

		void RenderTitle(RenderContext context)
		{
			Bind titleBind = GetBinding(nameof(Title));
			if (titleBind != null || !String.IsNullOrEmpty(Title))
			{
				var dt = new TagBuilder("a2-document-title");
				MergeBindingAttributeString(dt, context, "page-title", nameof(Title), Title);
				dt.Render(context);
			}
		}

		internal override void OnDispose()
		{
			base.OnDispose();
			Toolbar?.OnDispose();
			Taskpad?.OnDispose();
			Pager?.OnDispose();
		}

	}
}
