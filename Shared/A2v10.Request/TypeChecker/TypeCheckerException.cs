// Copyright © 2019-2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Request;

public sealed class TypeCheckerException : Exception
{
	public TypeCheckerException(String message)
		: base(message)
	{

	}
}
