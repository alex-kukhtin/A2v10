// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	[ContentProperty("Children")]
	public class Page : RootContainer
	{

		public UIElementBase Toolbar { get; set; }
		public UIElementBase Taskpad { get; set; }
		public Pager Pager { get; set; }
		public String Title { get; set; }
		//public Double Zoom { get; set; }

		public PrintPage PrintPage { get; set; }

		public BackgroundStyle Background { get; set; }
		public CollectionView CollectionView { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
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
				if (!isGridPage)
					MergeAttributes(page, context, MergeAttrMode.Margin);

				if (PrintPage != null)
				{
					page.AddCssClass("print-target");
					page.AddCssClass(PrintPage.Orientation.ToString().ToLowerInvariant());
					page.MergeAttribute("v-print-page", PrintPage.ToJson());
				}

				page.RenderStart(context);
			}


			RenderTitle(context);

			if (isGridPage)
			{
				Toolbar?.RenderElement(context, (tag) => tag.AddCssClass("page-toolbar"));
				Taskpad?.RenderElement(context, (tag) => tag.AddCssClass("page-taskpad"));
				Pager?.RenderElement(context, (tag) => tag.AddCssClass("page-pager"));
				var content = new TagBuilder("div", "page-content");
				if (ChildHasWrapper)
					content.AddCssClass("with-wrapper");
				MergeAttributes(content, context, MergeAttrMode.Margin);
				content.RenderStart(context);
				RenderChildren(context);
				content.RenderEnd(context);
			}
			else
				RenderChildren(context);

			var outer = new TagBuilder("div", "page-canvas-outer").RenderStart(context);
			new TagBuilder("div", "page-canvas").MergeAttribute("id", "page-canvas").Render(context);
			outer.RenderEnd(context);

			RenderContextMenus();
			RenderAccelCommands(context);

			if (CollectionView != null)
				CollectionView.RenderEnd(context);
			else
			{
				if (page == null)
					throw new InvalidProgramException();
				page.RenderEnd(context);
			}
		}

		public Boolean ChildHasWrapper => Children != null && Children.Count == 1 && Children[0] is IHasWrapper;

		void AddAttributes(TagBuilder tag)
		{
			if (Background != BackgroundStyle.Default)
				tag.AddCssClass("background-" + Background.ToString().ToKebabCase());
			tag.AddCssClass(CssClass);
			tag.AddCssClassBoolNo(UserSelect, "user-select");
			if (Absolute != null)
			{
				Absolute.MergeAbsolute(tag);
				tag.MergeStyle("width", "auto");
				tag.MergeStyle("height", "auto");
			}

			/*
			if (Zoom != 0.0)
				tag.MergeStyle("zoom", Zoom.ToString());
			*/
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

		protected override void OnEndInit()
		{
			base.OnEndInit();
			Toolbar?.SetParent(this);
			Taskpad?.SetParent(this);
			Pager?.SetParent(this);
			CollectionView?.SetParent(this);
		}

		public override void OnSetStyles()
		{
			base.OnSetStyles();
			Toolbar?.OnSetStyles();
			Taskpad?.OnSetStyles();
			Pager?.OnSetStyles();
			CollectionView?.OnSetStyles();
		}

		public override void OnDispose()
		{
			base.OnDispose();
			Toolbar?.OnDispose();
			Taskpad?.OnDispose();
			Pager?.OnDispose();
			CollectionView?.OnDispose();
		}

		protected override T FindInside<T>()
		{
			if (this is T elemT)
				return elemT;
			else if (Toolbar is T toolbar)
				return toolbar;
			else if (CollectionView is T collectionView)
				return collectionView;
			else if (Taskpad is T taskpad)
				return taskpad;
			else if (Pager is T pager)
				return pager;
			return null;
		}
	}
}
