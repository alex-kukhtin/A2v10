// Copyright © 2012-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Request
{

	internal class SCRIPT_PARTS
	{
		internal const String HEADER =
		@"
<script type=""text/javascript"">
'use strict';
(function() {
	const DataModelController = component('baseController');
	const eventBus = require('std:eventBus');
	const utils = require('std:utils');
	const uPeriod = require('std:period');
	const currentModule = $(CurrentModule);
";

		internal const String DATAFUNC =
		@"
function() {
	$(RequiredModules)

	const rawData = $(DataModelText);
	const template = $(TemplateText);

	$(ModelScript)
		
	return {
		dataModel: modelData(template, rawData)
	};
}
";

		internal const String DATAFUNC_SERVER =
		@"
	const $$server = function() {
		$(RequiredModules)

		const rawData = $(DataModelText);
		const rawDataRq = $(RawDataText);

		const template = $(TemplateText);

		$(ModelScript)
		
		const host = {
			$viewModel: {},
			$ctrl: {}
		};

		return {
			dataModelDb: function() {
				let md = modelData(template, rawData);
				md._host_ = host;
				return md;
			},
			dataModelRq: function() {
				let md = modelData(template, rawDataRq);
				md._host_ = host;
				return md;
			},
			createModel: function(jsonData) {
				let md = modelData(template, jsonData);
				md._host_ = host;
				return md;
			}
		};
	}
";

		internal const String FOOTER =
		@"
eventBus.$emit('beginLoad');
const vm = new DataModelController({
	el:'#$(RootId)',
	props: {
		inDialog: {type: Boolean, default: $(IsDialog)},
		pageTitle: {type: String}
	},
	data: currentModule().dataModel,
	computed: {
		utils() { return utils; },
		period() { return uPeriod; }
	},
	mounted() {
		eventBus.$emit('endLoad');
	}
});

vm.$data._host_ = {
	$viewModel: vm,
	$ctrl: vm.__createController__(vm)
};

vm.__doInit__('$(BaseUrl)');

})();
</script>
";
	}

	public class VueDataScripter : IDataScripter
	{
		IApplicationHost _host;
		ILocalizer _localizer;
		public VueDataScripter(IApplicationHost host, ILocalizer localizer)
		{
			_host = host;
			_localizer = localizer;
		}

		public String CreateDataModelScript(IDataModel model)
		{
			return model != null ? model.CreateScript(this) : CreateEmptyStript();
		}

		public String CreateScript(IDataHelper helper, IDictionary<String, Object> sys, IDictionary<String, IDataMetadata> meta)
		{
			var sb = new StringBuilder();
			sb.AppendLine("function modelData(template, data) {");
			sb.AppendLine("const cmn = require('std:datamodel');");
			if (meta != null)
			{
				sb.Append(GetConstructors(meta));
			}
			sb.AppendLine("cmn.implementRoot(TRoot, template, ctors);");
			sb.AppendLine("let root = new TRoot(data);");
			sb.Append(SetModelInfo(helper, sys));
			sb.AppendLine();
			sb.AppendLine("return root;");
			sb.AppendLine("}");
			return sb.ToString();
		}

		String CreateEmptyStript()
		{
			return @"
function modelData(template, data) {
	const cmn = require('std:datamodel');
	function TRoot(source, path, parent) { cmn.createObject(this, source, path, parent);}
	cmn.defineObject(TRoot, { props: { } }, false);
	cmn.implementRoot(TRoot, template, {TRoot});
	let root = new TRoot(data);
	cmn.setModelInfo(root, {}, rawData); 
	return root;
}
";
			var sb = new StringBuilder();
			sb.AppendLine("function modelData(template, data) {");
			sb.AppendLine("const cmn = require('std:datamodel');");
			sb.AppendLine("function TRoot(source, path, parent) {");
			sb.AppendLine("cmn.createObject(this, source, path, parent);}");
			sb.AppendLine("cmn.defineObject(TRoot, { props: { } }, false);");
			sb.AppendLine("const ctors = {TRoot};");
			sb.AppendLine("cmn.implementRoot(TRoot, template, ctors);");
			sb.AppendLine("let root = new TRoot(data);");
			sb.AppendLine("cmn.setModelInfo(root, {}, rawData); return root;}");
			return sb.ToString();
		}

		StringBuilder SetModelInfo(IDataHelper helper, IDictionary<String, Object> sys)
		{
			if (sys == null)
				return null;
			var sb = new StringBuilder("cmn.setModelInfo(root, {\n");
			foreach (var k in sys)
			{
				var val = k.Value;
				if (val is Boolean)
					val = val.ToString().ToLowerInvariant();
				else if (val is String)
					val = $"'{val}'";
				else if (val is Object)
					val = JsonConvert.SerializeObject(val);
				else if (val is DateTime)
					val = helper.DateTime2StringWrap(val);
				sb.Append($"'{k.Key}': {val},");
			}
			sb.RemoveTailComma();
			sb.Append("}, rawData);");
			return sb;
		}

		StringBuilder GetConstructors(IDictionary<String, IDataMetadata> meta)
		{
			if (meta == null)
				return null;
			var sb = new StringBuilder();
			foreach (var m in meta)
			{
				sb.Append(GetOneConstructor(m.Key, m.Value));
				sb.AppendLine();
			}
			// make ctors
			sb.Append("const ctors = {");
			foreach (var re in meta)
			{
				sb.Append(re.Key).Append(",");
				if (re.Value.IsArrayType)
					sb.Append(re.Key + "Array").Append(",");
			}
			sb.RemoveTailComma();
			sb.AppendLine("};");
			return sb;
		}

		StringBuilder GetOneConstructor(String name, IDataMetadata ctor)
		{
			var sb = new StringBuilder();
			String arrItem = ctor.IsArrayType ? "true" : "false";

			sb.AppendLine($"function {name}(source, path, parent) {{")
			.AppendLine("cmn.createObject(this, source, path, parent);")
			.AppendLine("}")
			// metadata
			.Append($"cmn.defineObject({name}, {{props: {{")
			.Append(GetProperties(ctor))
			.Append("}")
			.Append(GetSpecialProperties(ctor))
			.AppendLine($"}}, {arrItem});");

			if (ctor.IsArrayType)
			{
				sb.AppendLine($"function {name}Array(source, path, parent) {{")
				.AppendLine($"return cmn.createArray(source, path, {name}, {name}Array, parent);")
				.AppendLine("}");
			}
			return sb;
		}

		public StringBuilder GetProperties(IDataMetadata meta)
		{
			var sb = new StringBuilder();
			foreach (var fd in meta.Fields)
			{
				var fm = fd.Value;
				String propObj = fm.GetObjectType($"{meta.Name}.{fd.Key}");
				if (propObj == "String")
				{
					if (fm.IsJson)
						propObj = $"{{type:String, len:{fm.Length}, json:true}}";
					else
						propObj = $"{{type:String, len:{fm.Length}}}";
				}
				else if (propObj == "TPeriod")
					propObj = $"{{type: uPeriod.constructor}}";
				sb.Append($"'{fd.Key}'")
				.Append(':')
				.Append(propObj)
				.Append(",");
			}
			if (sb.Length == 0)
				return sb;
			sb.RemoveTailComma();
			return sb;
		}

		static String GetCrossProperties(IDataMetadata meta)
		{
			var sb = new StringBuilder("{");
			foreach (var c in meta.Cross)
			{
				sb.Append($"{c.Key}: [");
				if (c.Value != null)
					sb.Append(String.Join(",", c.Value.Select(s =>  $"'{s}'")));
				sb.Append("]");
			}
			sb.AppendLine("}");
			return sb.ToString();
		}

		public String GetSpecialProperties(IDataMetadata meta)
		{
			StringBuilder sb = new StringBuilder();
			if (!String.IsNullOrEmpty(meta.Id))
				sb.Append($"$id: '{meta.Id}',");
			if (!String.IsNullOrEmpty(meta.Name))
				sb.Append($"$name: '{meta.Name}',");
			if (!String.IsNullOrEmpty(meta.RowNumber))
				sb.Append($"$rowNo: '{meta.RowNumber}',");
			if (!String.IsNullOrEmpty(meta.HasChildren))
				sb.Append($"$hasChildren: '{meta.HasChildren}',");
			if (!String.IsNullOrEmpty(meta.MapItemType))
				sb.Append($"$itemType: {meta.MapItemType},");
			if (!String.IsNullOrEmpty(meta.Permissions))
				sb.Append($"$permissions: '{meta.Permissions}',");
			if (!String.IsNullOrEmpty(meta.Items))
				sb.Append($"$items: '{meta.Items}',");
			if (!String.IsNullOrEmpty(meta.MainObject))
				sb.Append($"$main: '{meta.MainObject}',");
			if (!String.IsNullOrEmpty(meta.Token))
				sb.Append($"$token: '{meta.Token}',");
			if (meta.IsGroup)
				sb.Append($"$group: true,");
			if (meta.HasCross)
				sb.Append($"$cross: {GetCrossProperties(meta)},");
			StringBuilder lazyFields = new StringBuilder();
			foreach (var f in meta.Fields)
			{
				if (f.Value.IsLazy)
					lazyFields.Append($"'{f.Key}',");
			}
			if (lazyFields.Length != 0)
			{
				lazyFields.RemoveTailComma();
				sb.Append($"$lazy: [{lazyFields.ToString()}]");
			}
			if (sb.Length == 0)
				return null;
			sb.RemoveTailComma();
			return ",\n" + sb.ToString();
		}


		public String CreateServerScript(IDataModel model, String template)
		{
			throw new NotImplementedException(nameof(CreateServerScript));
		}

		public String CreateServerScript(IDataModel model, String template, String requiredModules)
		{
			var sb = new StringBuilder(SCRIPT_PARTS.DATAFUNC);
			sb.Replace("$(TemplateText)", template);
			sb.Replace("$(RequiredModules)", requiredModules);
			String modelScript = model.CreateScript(this);
			String rawData = JsonConvert.SerializeObject(model.Root, JsonHelpers.StandardSerializerSettings);
			sb.Replace("$(DataModelText)", rawData);
			sb.Replace("$(ModelScript)", modelScript);

			return sb.ToString();
		}

		String CreateTemplateForWrite(String fileTemplateText)
		{
			if (fileTemplateText != null && fileTemplateText.Contains("define([\"require\", \"exports\"]"))
			{
				// amd module
				return fileTemplateText;
			}

			const String tmlHeader =
@"(function() {
	let module = { exports: undefined };
	(function(module, exports) {
";

			const String tmlFooter =
@"
	})(module, module.exports);
	return module.exports;
})()";

			var sb = new StringBuilder();

			sb.AppendLine()
			.AppendLine(tmlHeader)
			.AppendLine(fileTemplateText)
			.AppendLine(tmlFooter);
			return sb.ToString();
		}

		void AddRequiredModules(StringBuilder sb, String clientScript)
		{
			const String tmlHeader =
@"
	app.modules['$(Module)'] = function() {
	let module = { exports: undefined };
	(function(module, exports) {
";

			const String tmlFooter =
@"
	})(module, module.exports);
	return module.exports;
};";

			if (String.IsNullOrEmpty(clientScript))
				return;
			var _modulesWritten = new HashSet<String>();
			Int32 iIndex = 0;
			while (true)
			{
				String moduleName = FindModuleNameFromString(clientScript, ref iIndex);
				if (moduleName == null)
					return; // not found
				if (String.IsNullOrEmpty(moduleName))
					continue;
				if (moduleName.ToLowerInvariant().StartsWith("global/"))
					continue;
				if (moduleName.ToLowerInvariant().StartsWith("std:"))
					continue;
				if (moduleName.ToLowerInvariant().StartsWith("app:"))
					continue;
				if (_modulesWritten.Contains(moduleName))
					continue;
				var fileName = moduleName.AddExtension("js");
				var appReader = _host.ApplicationReader;
				String filePath = appReader.MakeFullPath(String.Empty, fileName.RemoveHeadSlash());
				//var filePath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey ?? String.Empty, fileName.RemoveHeadSlash()));
				if (!appReader.FileExists(filePath))
					throw new FileNotFoundException(filePath);
				String moduleText = appReader.FileReadAllText(filePath);

				if (moduleText.Contains("define([\"require\", \"exports\"]"))
				{
					sb.Append($"if (app.modules['{moduleName}'] == undefined) {{")
					.AppendLine()
					.Append($"app.modules['{moduleName}'] = function() {{return ")
					.AppendLine(Localize(moduleText))
					.AppendLine()
					.AppendLine("}};");
				}
				else
				{
					sb.AppendLine(tmlHeader.Replace("$(Module)", moduleName))
						.AppendLine(Localize(moduleText))
						.AppendLine(tmlFooter)
						.AppendLine();
				}
				_modulesWritten.Add(moduleName);
				AddRequiredModules(sb, moduleText);
			}
		}

		public static String FindModuleNameFromString(String text, ref Int32 pos)
		{
			String funcName = "require";
			Int32 rPos = text.IndexOf(funcName, pos);
			if (rPos == -1)
				return null; // не продолжаем, ничего не нашли
			pos = rPos + funcName.Length;
			// проверим, что мы не в комментарии
			Int32 oc = text.LastIndexOf("/*", rPos);
			Int32 cc = text.LastIndexOf("*/", rPos);
			if (oc != -1)
			{
				// есть открывающий комментарий
				if (cc == -1)
				{
					return String.Empty; // нет закрывающего
				}
				if (cc < oc)
				{
					return String.Empty; // закрывающий левее открывающего, мы внутри
				}
			}
			Int32 startLine = text.LastIndexOfAny(new Char[] { '\r', '\n' }, rPos);
			oc = text.LastIndexOf("//", rPos);
			if ((oc != 1) && (oc > startLine))
				return String.Empty; // есть однострочный и он после начала строки

			Tokenizer tokenizer = null;
			try
			{
				// проверим точку, как предыдущий токен
				var dotPos = text.LastIndexOf('.', rPos);
				if (dotPos != -1)
				{
					tokenizer = new Tokenizer(text, dotPos);
					if (tokenizer.token.id == Tokenizer.TokenId.Dot)
					{
						tokenizer.NextToken();
						var tok = tokenizer.token;
						if (tok.id == Tokenizer.TokenId.Identifier && tok.Text == "require")
						{
							tokenizer.NextToken();
							if (tokenizer.token.id == Tokenizer.TokenId.OpenParen)
								return String.Empty; /* есть точка перед require */
						}
					}
				}
				tokenizer = new Tokenizer(text, rPos + funcName.Length);
				if (tokenizer.token.id == Tokenizer.TokenId.OpenParen)
				{
					tokenizer.NextToken();
					if (tokenizer.token.id == Tokenizer.TokenId.StringLiteral)
					{
						pos = tokenizer.GetTextPos();
						return tokenizer.token.UnquotedText.Replace("\\\\", "/");
					}
				}
				pos = tokenizer.GetTextPos();
				return String.Empty;
			}
			catch (Exception /*ex*/)
			{
				// parser error
				if (tokenizer != null)
					pos = tokenizer.GetTextPos();
				return null;
			}
		}

		private String Localize(String source)
		{
			String result = _localizer.Localize(null, source, replaceNewLine: false);
			return _host.GetAppSettings(result);
		}

		public async Task<ScriptInfo> GetModelScript(ModelScriptInfo msi)
		{
			var result = new ScriptInfo();
			StringBuilder output = new StringBuilder();
			String dataModelText = "{}";
			String templateText = "{}";
			StringBuilder sbRequired = new StringBuilder();

			// write model script
			String fileTemplateText = null;
			if (msi.Template != null)
			{
				fileTemplateText = await _host.ApplicationReader.ReadTextFileAsync(msi.Path, msi.Template + ".js");
				if (fileTemplateText == null)
					throw new FileNotFoundException($"Template file '{Path.Combine(msi.Path, msi.Template + ".js").Replace('\\', '/')}' not found.");
				AddRequiredModules(sbRequired, fileTemplateText);
				templateText = CreateTemplateForWrite(Localize(fileTemplateText));
			}
			if (msi.DataModel != null)
			{
				dataModelText = JsonConvert.SerializeObject(msi.DataModel.Root, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			}

			var header = new StringBuilder(SCRIPT_PARTS.HEADER);
			header.Replace("$(RootId)", msi.RootId);

			var modelFunc = new StringBuilder(SCRIPT_PARTS.DATAFUNC);
			modelFunc.Replace("$(RequiredModules)", sbRequired?.ToString());
			modelFunc.Replace("$(TemplateText)", Localize(templateText));
			modelFunc.Replace("$(DataModelText)", dataModelText);
			String modelScript = CreateDataModelScript(msi.DataModel);
			modelFunc.Replace("$(ModelScript)", modelScript);
			result.DataScript = modelFunc.ToString();

			header.Replace("$(CurrentModule)", modelFunc.ToString());
			output.Append(header);

			var footer = new StringBuilder(SCRIPT_PARTS.FOOTER);
			footer.Replace("$(RootId)", msi.RootId);
			footer.Replace("$(BaseUrl)", msi.BaseUrl);
			footer.Replace("$(IsDialog)", msi.IsDialog.ToString().ToLowerInvariant());
			output.Append(footer);
			result.Script = output.ToString();

			return result;
		}

		public ScriptInfo GetServerScript(ModelScriptInfo msi)
		{
			StringBuilder sbRequired = null;
			String templateText = "{}";
			if (msi.Template != null)
			{
				String fileTemplateText = _host.ApplicationReader.ReadTextFile(msi.Path, msi.Template + ".js");
				if (fileTemplateText == null)
					throw new FileNotFoundException($"File not found. '{Path.Combine(msi.Path, msi.Template)}'");
				sbRequired = new StringBuilder();
				AddRequiredModules(sbRequired, fileTemplateText);
				templateText = CreateTemplateForWrite(Localize(fileTemplateText));
			}
			var sb = new StringBuilder(SCRIPT_PARTS.DATAFUNC_SERVER);
			sb.Replace("$(TemplateText)", templateText);
			sb.Replace("$(RequiredModules)", sbRequired?.ToString());
			String modelScript = msi.DataModel.CreateScript(this);
			String rawData = JsonConvert.SerializeObject(msi.DataModel.Root, JsonHelpers.ConfigSerializerSettings(_host.IsDebugConfiguration));
			sb.Replace("$(DataModelText)", rawData);
			sb.Replace("$(RawDataText)", msi.RawData ?? "{}");
			sb.Replace("$(ModelScript)", modelScript);

			return new ScriptInfo()
			{
				Script = sb.ToString()
			};
		}
	}
}