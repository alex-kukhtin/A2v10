// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Reflection;
using System.Windows.Markup;

namespace A2v10.Xaml;

public abstract class BindBase : MarkupExtension, ISupportBinding
{
	BindImpl _bindImpl;

	public BindImpl BindImpl
	{
		get
		{
			_bindImpl ??= new BindImpl();
			return _bindImpl;
		}
	}

	public override Object ProvideValue(IServiceProvider serviceProvider)
	{
		if (serviceProvider.GetService(typeof(IProvideValueTarget)) is not IProvideValueTarget iTarget)
			return null;
		var targetProp = iTarget.TargetProperty as PropertyInfo;
		var targetObj = iTarget.TargetObject as ISupportBinding;
		if ((targetObj == null) && (targetProp == null))
			return null;
		targetObj.BindImpl.SetBinding(targetProp.Name, this);
		if (targetProp.PropertyType.IsValueType)
			return Activator.CreateInstance(targetProp.PropertyType);
		return null; // is object
	}

	public Bind GetBinding(String name)
	{
		return _bindImpl?.GetBinding(name);
	}

	void SetBinding(String name, BindBase bind)
	{
		_bindImpl.SetBinding(name, bind);
	}

	public BindCmd GetBindingCommand(String name)
	{
		return _bindImpl?.GetBindingCommand(name);
	}
}
