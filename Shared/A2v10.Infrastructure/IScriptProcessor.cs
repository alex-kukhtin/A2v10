// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Data.Interfaces;

namespace A2v10.Infrastructure
{
	public interface IScriptProcessor
	{
		String ValidateModel(IDataModel model, String templateScript);
	}
}
