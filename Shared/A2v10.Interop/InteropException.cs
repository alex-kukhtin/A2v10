// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Interop
{
	public sealed class InteropException : Exception
	{
		public InteropException(String message)
			:base(message)
		{
		}
	}
}
