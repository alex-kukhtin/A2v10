// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

using Newtonsoft.Json;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Infrastructure.Utilities;

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

internal const String FOOTER =
@"
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

	public partial class BaseController
	{
		public async Task<ScriptInfo> WriteModelScript(RequestView rw, IDataModel model, String rootId)
		{
			var result = new ScriptInfo();
			StringBuilder output = new StringBuilder();
			String dataModelText = "{}";
			String templateText = "{}";
			StringBuilder sbRequired = new StringBuilder();

			// write model script
			String fileTemplateText = null;
			if (rw.template != null)
			{
				fileTemplateText = await _host.ReadTextFile(Admin, rw.Path, rw.template + ".js");
				AddRequiredModules(sbRequired, fileTemplateText);
				templateText = CreateTemplateForWrite(_localizer.Localize(null, fileTemplateText));
			}
			if (model != null)
			{
				dataModelText = JsonConvert.SerializeObject(model.Root, StandardSerializerSettings);
			}

			var header = new StringBuilder(SCRIPT_PARTS.HEADER);
			header.Replace("$(RootId)", rootId);

			var modelFunc = new StringBuilder(SCRIPT_PARTS.DATAFUNC);
			modelFunc.Replace("$(RequiredModules)", sbRequired?.ToString());
			modelFunc.Replace("$(TemplateText)", _localizer.Localize(null, templateText));
			modelFunc.Replace("$(DataModelText)", dataModelText);
			String modelScript = _scripter.CreateDataModelScript(model);
			modelFunc.Replace("$(ModelScript)", modelScript);
			result.DataScript = modelFunc.ToString();

			header.Replace("$(CurrentModule)", modelFunc.ToString());
			output.Append(header);

			var footer = new StringBuilder(SCRIPT_PARTS.FOOTER);
			footer.Replace("$(RootId)", rootId);
			footer.Replace("$(BaseUrl)", rw.ParentModel.BasePath);
			footer.Replace("$(IsDialog)", rw.IsDialog.ToString().ToLowerInvariant());
			output.Append(footer);
			result.Script = output.ToString();

			return result;
		}

		String CreateTemplateForWrite(String fileTemplateText)
		{

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

		HashSet<String> _modulesWritten;

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
			if (_modulesWritten == null)
				_modulesWritten = new HashSet<String>();
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
				var filePath = Path.GetFullPath(Path.Combine(_host.AppPath, _host.AppKey, fileName.RemoveHeadSlash()));
				if (!File.Exists(filePath))
					throw new FileNotFoundException(filePath);
				String moduleText = File.ReadAllText(filePath);
				sb.AppendLine(tmlHeader.Replace("$(Module)", moduleName))
					.AppendLine(_localizer.Localize(null, moduleText, replaceNewLine: false))
					.AppendLine(tmlFooter)
					.AppendLine();
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


		public String CreateServerScript(IDataModel model, String template, String requiredModules)
		{
			var sb = new StringBuilder(SCRIPT_PARTS.DATAFUNC);
			sb.Replace("$(TemplateText)", template);
			sb.Replace("$(RequiredModules)", requiredModules);
			String modelScript = model.CreateScript(_scripter);
			String rawData = JsonConvert.SerializeObject(model.Root, BaseController.StandardSerializerSettings);
			sb.Replace("$(DataModelText)", rawData);
			sb.Replace("$(ModelScript)", modelScript);

			return sb.ToString();
		}

	}
}
