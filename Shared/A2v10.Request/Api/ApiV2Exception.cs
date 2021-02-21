// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Request.Api
{
	public sealed class ApiV2Exception : Exception
	{
		public ApiV2Exception(String msg)
			:base(msg)
		{
		}
	}
}
