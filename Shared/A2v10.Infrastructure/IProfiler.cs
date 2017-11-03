// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure
{
	public enum ProfileAction
	{
		Sql,
		Xaml,
        Workflow
	};

	public interface IProfiler
	{
		IDisposable Start(ProfileAction kind, String description);
	}
}
