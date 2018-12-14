// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;

using A2v10.Data.Interfaces;

namespace A2v10.Infrastructure
{
	public class ServerScriptInfo
	{
		public IDataModel DataModel;
		public String RawData;
		public String Template;
		public String Path;
		public Object Parameter;
	}

	public interface IScriptProcessor
	{
		Object ValidateModel(ServerScriptInfo ssi);
		Object RunScript(ServerScriptInfo ssi, String scriptName);
	}
}
