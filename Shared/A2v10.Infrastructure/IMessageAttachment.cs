// Copyright © 2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;

namespace A2v10.Infrastructure
{
	public interface IMessageAttachment
	{
		Stream Stream { get; }
		String Name { get; }
		String Mime { get; }
	}
}
