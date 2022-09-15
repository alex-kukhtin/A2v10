// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
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
	public class CollectionView : UIElementBase
	{
		public Object ItemsSource { get; set; }

		public Int32? PageSize { get; set; }

		public RunMode RunAt { get; set; }

		public UIElementCollection Children { get; set; } = new UIElementCollection();

		public SortDescription Sort { get; set; }

		public GroupDescription GroupBy { get; set; }

		public FilterDescription Filter { get; set; }

		public String FilterDelegate { get; set; }

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (SkipRender(context))
				return;
			RenderStart(context, onRender);
			foreach (var ch in Children)
				ch.RenderElement(context);
			RenderEnd(context);
		}

		TagBuilder _outer = null;
		TagBuilder _inner = null;

		internal void RenderStart(RenderContext context, Action<TagBuilder> onRender = null)
		{
			if (context.IsDialog && RunAt == RunMode.ServerUrl)
				throw new XamlException("RunAt='ServerUrl' is not allowed in dialogs");
			String cwTag = "collection-view";
			if (RunAt == RunMode.Server)
				cwTag = "collection-view-server";
			else if (RunAt == RunMode.ServerUrl)
				cwTag = "collection-view-server-url";
			_outer = new TagBuilder(cwTag, "cw", IsInGrid);
			onRender?.Invoke(_outer);
			if (Parent is Page)
				_outer.AddCssClass("cw-absolute");
			MergeAttributes(_outer, context);
			Bind itemsSource = GetBinding(nameof(ItemsSource));
			if (itemsSource != null)
				_outer.MergeAttribute(":items-source", itemsSource.GetPath(context));

			if (Sort != null)
				_outer.MergeAttribute(":initial-sort", Sort.GetJsValue(context));
			if (Filter != null)
			{
				_outer.MergeAttribute(":initial-filter", Filter.GetJsValue(context));
				_outer.MergeAttribute(":persistent-filter", Filter.GetPersistentValue(context));
				if (RunAt == RunMode.Client)
				{
					if (String.IsNullOrEmpty(FilterDelegate))
						throw new XamlException("To filter on the client, a FilterDelegate is required");
					_outer.MergeAttribute(":filter-delegate", $"$delegate('{FilterDelegate}')");
				}
			}

			if (GroupBy != null)
			{
				_outer.MergeAttribute(":initial-group", GroupBy.GetJsValue(context));
			}

			if (PageSize != null)
			{
				_outer.MergeAttribute(":initial-page-size", PageSize.Value.ToString());
			}

			_outer.RenderStart(context);
			_inner = new TagBuilder("template");
			_inner.MergeAttribute("slot-scope", "Parent");
			_inner.RenderStart(context);
		}

		internal void RenderEnd(RenderContext context)
		{
			_inner.RenderEnd(context);
			_outer.RenderEnd(context);
		}

		protected override void OnEndInit()
		{
			base.OnEndInit();
			foreach (var ch in Children)
				ch.SetParent(this);
		}

		public override void OnSetStyles(RootContainer root)
		{
			base.OnSetStyles(root);
			foreach (var ch in Children)
				ch.OnSetStyles(root);
		}

		public override void OnDispose()
		{
			base.OnDispose();
			foreach (var c in Children)
				c.OnDispose();
		}
	}
}
