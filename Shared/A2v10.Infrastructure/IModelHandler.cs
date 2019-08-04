// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{
	public interface IModelHandler
	{
		// If returns true, then saving is not called
		Task<Boolean> BeforeSave(Object beforeData);

		Task AfterSave(Object beforeData, Object afterData);
		// Inject
	}
}
