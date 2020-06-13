// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public enum AddressKind
	{
		From,
		To,
		CC,
		BCC,
		Phone
	}

	public interface IMessageAddress
	{
		String Address { get; }
		String DisplayName { get; }

		AddressKind Kind { get; }
		String Phone { get; }
	}
}
