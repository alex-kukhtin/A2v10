﻿// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public interface IControllerProfiler
	{
		IProfiler Profiler { get; }
		Boolean SkipRequest(String Url);
	}
}
