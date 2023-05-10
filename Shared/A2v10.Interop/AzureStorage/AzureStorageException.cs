// Copyright © 2020-2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Interop.AzureStorage;

public sealed class AzureStorageException : Exception
{
	public AzureStorageException(String message)
		: base(message)
	{
	}
}
