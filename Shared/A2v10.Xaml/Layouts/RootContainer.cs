// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.


using System;
using System.Collections.Generic;
using System.Windows.Markup;

namespace A2v10.Xaml
{
	[Serializable]
	public class ResourceDictionary : Dictionary<String, Object>
	{

	}

	public abstract class RootContainer : Container, IUriContext, IDisposable
	{
		#region IUriContext
		public Uri BaseUri { get; set; }
		#endregion

		#region IDisposable
		public void Dispose()
		{
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

		public Object FindResource(String key)
		{
			if (_resources == null)
				return null;
			Object resrc;
			if (_resources.TryGetValue(key, out resrc))
				return resrc;
			return null;
		}
	}
}
