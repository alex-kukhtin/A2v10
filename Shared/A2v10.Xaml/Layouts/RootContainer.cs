// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.


using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[Serializable]
	public class ResourceDictionary : Dictionary<String, Object>
	{
		public ResourceDictionary()
		{

		}

		protected ResourceDictionary(SerializationInfo info, StreamingContext context)
			: base(info, context)
		{
		}
	}

	public abstract class RootContainer : Container, IUriContext, IDisposable
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
		protected ResourceDictionary _resources;

		public ResourceDictionary Resources
		{
			get
			{
				if (_resources == null)
					_resources = new ResourceDictionary();
				return _resources;
			}
			set
			{
				_resources = value;
			}
		}
		public AccelCommandCollection AccelCommands { get; set; } = new AccelCommandCollection();

		public Object FindResource(String key)
		{
			if (_resources == null)
				return null;
			if (_resources.TryGetValue(key, out Object resrc))
				return resrc;
			return null;
		}

		internal Styles Styles { get; set; }

		protected virtual void RenderAccelCommands(RenderContext context)
		{
			if (AccelCommands == null || AccelCommands.Count == 0)
				return;
			var cmd = new TagBuilder("template");
			cmd.RenderStart(context);
			foreach (var ac in AccelCommands)
				ac.RenderElement(context);
			cmd.RenderEnd(context);
		}

		private List<Action> _contextMenus = new List<Action>();
		public void RegisterContextMenu(Action action)
		{
			_contextMenus.Add(action);
		}

		public void RenderContextMenus()
		{
			foreach (var a in _contextMenus)
				a();
		}
	}
}
