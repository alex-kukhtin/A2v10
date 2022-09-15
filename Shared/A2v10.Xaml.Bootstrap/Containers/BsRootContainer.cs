// Copyright © 2021-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Windows.Markup;

namespace A2v10.Xaml.Bootstrap
{
	public abstract class BsRootContainer : Container, IUriContext, IDisposable, IRootContainer
	{
		#region IUriContext
		public Uri BaseUri { get; set; }
		#endregion
		#region IDisposable

		public void Dispose()
		{
			Dispose(true);
		}

		protected virtual void Dispose(Boolean dispoising)
		{
			if (dispoising)
				OnDispose();
		}
		#endregion

		#region IRootContainer
		public void SetStyles(Styles styles)
		{
		}

		public String Components { get; set; }

		public void AddComponent(String name, XamlElement comp)
		{
		}
		public XamlElement FindComponent(String name)
		{
			return null;
		}

		#endregion

		public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
		{
			base.RenderElement(context, (tag) =>
			{
				tag.MergeAttribute("id", context.RootId);
				onRender?.Invoke(tag);
			});
		}

	}
}
