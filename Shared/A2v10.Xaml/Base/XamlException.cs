// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml
{
    [Serializable]
	public class XamlException : Exception
	{
		public XamlException(String msg)
			: base(msg)
		{
		}
	}
}
