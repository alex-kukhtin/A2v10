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

		public Object ValidateModel(ServerScriptInfo ssi)
		{
			using (var disp = CreateScript() as IDisposable)
			{
				var sc = disp as IScriptContext;
				StartScript(sc);
				return RunDataScript(sc, ssi, "validate");
			}
		}


		void StartScript(IScriptContext sc)
		{
			sc.Start();
			LoadLibrary(sc);
		}

		String LoadFile(String file)
		{
			var hostPath = _host.HostingPath;
			String path = Path.Combine(hostPath, $"scripts/server/{file}.js");
			if (!File.Exists(path))
				throw new FileNotFoundException(path);
			return File.ReadAllText(path);
		}

		void LoadLibrary(IScriptContext sc)
		{
			String script = LoadFile("library");
			sc.LoadLibrary(script);
		}

		Object RunDataScript(IScriptContext sc, ServerScriptInfo ssi, String operation)
		{
			var msi = new ModelScriptInfo()
			{
				DataModel = ssi.DataModel,
				Template = ssi.Template,
				Path = ssi.Path,
				RawData = ssi.RawData
			};
			var ss = _scripter.GetServerScript(msi);
			sc.RunScript(ss.Script);
			var opScript = LoadFile(operation);
			return sc.RunScript(opScript);
		}
	}
}
