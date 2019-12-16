// Copyright © 2018-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Runtime
{
	public class DesktopException : Exception
	{
		public const String UserNotRegistered = "DE1001 User not registered";

		public DesktopException(String msg)
			: base(msg)
		{

		}
	}
}
