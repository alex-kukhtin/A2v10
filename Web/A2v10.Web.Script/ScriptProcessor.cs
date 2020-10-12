// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Web.Script
{
	public class ScriptProcessor : IScriptProcessor
	{
		private readonly IDataScripter _scripter;
		private readonly IApplicationHost _host;
		private readonly IApplicationConfig _config;

		public ScriptProcessor(IDataScripter scripter, IApplicationConfig config, IApplicationHost host)
		{
			_scripter = scripter ?? throw new ArgumentNullException(nameof(scripter));
			_host = host ?? throw new ArgumentNullException(nameof(host));
			_config = config ?? throw new ArgumentNullException(nameof(config));
		}

		IScriptContext CreateScript()
		{
			switch (_config.ScriptEngine)
			{
				case "JSRT":
					return new A2v10.Script.JSRT.ScriptContext(false); // EDGE without debugging
				case "JSRTDebug":
					return new A2v10.Script.JSRT.ScriptContext(true); // EDGE with debugging
				case "ChakraCore":
					return new A2v10.Script.ScriptContext();  // CHAKRA CORE
				case "None":
					return null;
				default:
					throw new InvalidProgramException("Invalid script engine. The possible values are 'ChakraCore', 'JSRT', 'JSRTDebug'");
			}
		}

		public Object ValidateModel(ServerScriptInfo ssi)
		{
			using (var disp = CreateScript() as IDisposable)
			{
				if (disp is IScriptContext sc) { 
					StartScript(sc);
					return RunDataScript(sc, ssi, "validate");
				}
			}
			throw new InvalidProgramException("Script engine is off");
		}

		public Object RunScript(ServerScriptInfo ssi, String scriptName)
		{
			using (var disp = CreateScript() as IDisposable)
			{
				if (disp is IScriptContext sc)
				{
					StartScript(sc);
					return RunDataScript(sc, ssi, scriptName);
				}
			}
			throw new InvalidProgramException("Script engine is off");
		}


		void StartScript(IScriptContext sc)
		{
			sc.Start();
			LoadLibrary(sc);
		}

		String LoadFile(String file)
		{
			var hostPath = _config.HostingPath;
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
			sc.RunScript(ss.Script, null);
			var opScript = LoadFile(operation);
			return sc.RunScript(opScript, ssi.Parameter);
		}
	}
}
