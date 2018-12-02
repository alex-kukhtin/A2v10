// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Web.Script
{
	public class ScriptProcessor : IScriptProcessor
	{
		private readonly IDataScripter _scripter;
		private readonly IApplicationHost _host;

		public ScriptProcessor(IDataScripter scripter, IApplicationHost host)
		{
			_scripter = scripter;
			_host = host;
		}

		IScriptContext CreateScript()
		{
			if (_host.IsDebugConfiguration)
				return new A2v10.Script.JSRT.ScriptContext(); // EDGE
			else
				return new A2v10.Script.ScriptContext();  // CHAKRA CORE
		}

		public String ValidateModel(IDataModel model, String baseUrl)
		{			
			using (var disp = CreateScript() as IDisposable)
			{
				var sc = disp as IScriptContext;
				StartScript(sc);
				RunDataScript(sc, model, baseUrl);
			}
			return null;
		}


		void StartScript(IScriptContext sc)
		{
			sc.Start();
			LoadLibrary(sc);
		}

		void LoadLibrary(IScriptContext sc)
		{
			String path = Path.GetFullPath("../../../../Web/A2v10.Web.Site/scripts/server/library.js");
			if (!File.Exists(path))
				throw new FileNotFoundException(path);
			String script = File.ReadAllText(path);
			sc.LoadLibrary(script);
		}

		void RunDataScript(IScriptContext sc, IDataModel model, String baseUrl)
		{
			var msi = new ModelScriptInfo()
			{
				DataModel = model
			};
			var ss = _scripter.GetServerScript(msi);
			sc.RunScript(ss.Script);
		}
	}
}
