// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Text;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Web.Script
{
	public class ScriptProcessor : IScriptProcessor
	{
		private readonly IDataScripter _scripter;

		public ScriptProcessor(IDataScripter scripter)
		{
			_scripter = scripter;
		}

		public String ValidateModel(IDataModel model, String templateScript)
		{
			using (var sc = new A2v10.Script.ScriptContext())
			{
				StartScript(sc);
				RunDataScript(sc, model, templateScript);
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

		void RunDataScript(IScriptContext sc, IDataModel model, String template)
		{
			var serverScript = _scripter.CreateServerScript(model, template);
			sc.RunScript(serverScript.ToString());
		}

		public static readonly JsonSerializerSettings StandardSerializerSettings =
			new JsonSerializerSettings()
			{
				Formatting = Formatting.Indented,
				StringEscapeHandling = StringEscapeHandling.EscapeHtml,
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DateTimeZoneHandling = DateTimeZoneHandling.Utc,
				NullValueHandling = NullValueHandling.Ignore,
				DefaultValueHandling = DefaultValueHandling.Ignore
			};
	}
}
