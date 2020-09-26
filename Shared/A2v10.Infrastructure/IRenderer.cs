// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using A2v10.Data.Interfaces;

namespace A2v10.Infrastructure
{
	public class RenderInfo
	{
		public String RootId;
		public String FileName;
		public String FileTitle;
		public String Path;
		public String Text;
		public TextWriter Writer;
		public IDataModel DataModel;
		public ILocalizer Localizer;
		public ITypeChecker TypeChecker;
		public String CurrentLocale;
		public Boolean IsDebugConfiguration;
		public Boolean SecondPhase;
	}

	public interface IRenderer
	{
		void Render(RenderInfo info);
	}
}
