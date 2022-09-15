// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.


using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Windows.Markup;

namespace A2v10.Xaml;

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

public abstract class RootContainer : Container, IUriContext, IDisposable, IRootContainer
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


	public override void OnDispose()
	{
		base.OnDispose();
		if (Components != null)
			foreach (var c in Components)
				c.Value.OnDispose();
	}

	#region IRootContainer
	public void SetStyles(Styles styles)
	{
		Styles = styles;
		OnSetStyles(this);
		if (Components != null)
			foreach (var c in Components)
				c.Value.OnSetStyles(this);

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
	public ComponentDictionary Components { get; set; }

	public XamlElement FindComponent(String name)
	{
		if (Components == null)
			return null;
		if (Components.TryGetValue(name, out XamlElement comp))
			return comp;
		return null;
	}


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
