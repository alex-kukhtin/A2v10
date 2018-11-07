// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IModelHandler
	{
		Task AfterSave(Object beforeData, Object afterData);
		// Inject
	}
}
