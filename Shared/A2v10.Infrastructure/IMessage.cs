// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;

namespace A2v10.Infrastructure
{
	public interface IMessage
	{
		Int64 Id { get; }

		String Template { get; set; }
		String Key { get; set; }

		String DataSource { get; set; }
		String Schema { get; set; }
		String Model { get; set; }
		Int64 ModelId { get; set; }

		String Source { get; set; }

		IDictionary<String, Object> Params { get; }
		IDictionary<String, Object> Environment { get; set; }

		List<IMessageAddress> To { get; }
		List<IMessageAddress> Bcc { get; }
		List<IMessageAddress> Cc { get; }
	}
}
