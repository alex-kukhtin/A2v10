// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.ComponentModel;

using A2v10.Infrastructure;

namespace A2v10.Xaml
{
	public class XamlElement : ISupportInitialize, ISupportBinding
	{

		internal XamlElement Parent { get; private set; }

		BindImpl _bindImpl;

		#region ISupportBinding
		public BindImpl BindImpl
		{
			get
			{
				if (_bindImpl == null)
					_bindImpl = new BindImpl();
				return _bindImpl;
			}
		}

		public Bind GetBinding(String name)
		{
			return _bindImpl?.GetBinding(name);
		}

		public void RemoveBinding(String name)
		{
			_bindImpl?.RemoveBinding(name);
		}

		public void SetBinding(String name, BindBase bind)
		{
			if (bind == null)
				return;
			BindImpl.SetBinding(name, bind);
		}

		public BindCmd GetBindingCommand(String name)
		{
			return _bindImpl?.GetBindingCommand(name);
		}
		#endregion

		protected virtual void OnEndInit()
		{
		}

		internal virtual void OnDispose()
		{

		}

		internal virtual void OnSetStyles()
		{

		}

		internal void SetParent(XamlElement parent)
		{
			Parent = parent;
		}

		protected virtual T FindInside<T>() where T: class
		{
			if (this is T)
				return this as T;
			return null;
		}

		internal T FindParent<T>() where T:class
		{
			var p = Parent;
			while (p != null)
			{
				var t = p.FindInside<T>();
				if (t != null)
					return t;
				p = p.Parent;
			}
			return default(T);
		}


		internal void MergeBoolAttribute(TagBuilder tag, RenderContext context, String propName, Boolean value)
		{
			var attrBind = GetBinding(propName);
			// bool attrs always with ':'
			String attrName = $":{propName.ToLowerInvariant()}";
			if (attrBind != null)
				tag.MergeAttribute(attrName, attrBind.GetPath(context));
			else if (value)
				tag.MergeAttribute(attrName, value.ToString().ToLowerInvariant());

		}

		internal String GetBindingString(RenderContext context, String propertyName, String propValue)
		{
			String resVal = null;
			var bindString = GetBinding(propertyName);
			if (bindString != null)
				resVal = bindString.GetPathFormat(context);
			else if (propValue != null)
				resVal = $"'{context.Localize(propValue)}'";
			return resVal;
		}

		internal void MergeBindingAttributeBool(TagBuilder tag, RenderContext context, String attrName, String propName, Boolean? propValue, Boolean bInvert = false)
		{
			String attrVal = null;
			var attrBind = GetBinding(propName);
			if (attrBind != null)
				attrVal = attrBind.GetPath(context);
			else if (propValue != null)
				attrVal = propValue.ToString().ToLowerInvariant();
			if (attrVal == null)
				return;
			if (bInvert)
				attrVal = "!" + attrVal;
			tag.MergeAttribute(attrName, attrVal);
		}

		internal void MergeCommandAttribute(TagBuilder tag, RenderContext context, Boolean withHref = true)
		{
			var cmd = GetBindingCommand("Command");
			if (cmd == null)
				return;
			cmd.MergeCommandAttributes(tag, context);
			tag.MergeAttribute("@click.prevent", cmd.GetCommand(context));
			if (withHref)
				tag.MergeAttribute(":href", cmd.GetHrefForCommand(context));
		}

		internal Boolean RenderIcon(RenderContext context, Icon icon, String addClass = null)
		{
			var iconBind = GetBinding("Icon");
			if (icon == Icon.NoIcon && iconBind == null)
				return false;
			var iTag = new TagBuilder("i", "ico");
			if (iconBind != null)
				iTag.MergeAttribute(":class", $"'ico-' + {iconBind.GetPath(context)}");
			else if (icon != Icon.NoIcon)
				iTag.AddCssClass($"ico-{icon.ToString().ToKebabCase()}");
			iTag.AddCssClass(addClass);
			iTag.Render(context);
			context.RenderSpace(); // after icon - always
			return true;
		}

		#region ISupportInitialize
		public void BeginInit()
		{
			// do nothing
		}

		public void EndInit()
		{
			OnEndInit();
		}
		#endregion
	}
}
