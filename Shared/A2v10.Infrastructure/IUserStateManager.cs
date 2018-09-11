// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IUserStateManager
	{
		void SetReadOnly(Boolean readOnly);
		Boolean IsReadOnly(Int64 userId);
	}
}
