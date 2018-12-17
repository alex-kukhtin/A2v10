// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	[Serializable]
	public class JSRuntimeException : Exception
	{
		public JSRuntimeException(String message)
			:base(message)
		{

		}
	}
}
