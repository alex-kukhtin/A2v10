// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Infrastructure
{
	public interface IQueuedMessage
	{
		Int64 Id { get; }

		Int64 TargetId { get; set; }
		String Template { get; set; }
		String Key { get; set; }

		String Source { get; set; }

		IDictionary<String, Object> Parameters { get; }
		IDictionary<String, Object> Environment { get; }

		Boolean Immediately { get; set; }
	}
}
