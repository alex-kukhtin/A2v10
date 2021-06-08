// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Text;

using A2v10.Infrastructure;

/*
 * $exec(cmd, arg, confirm, opts) : $canExecute(cmd, arg, opts)
 * $dialog(cmd, url, arg, data(query), opts)
 */

namespace A2v10.Xaml
{
	public enum CommandType
	{
		Unknown,
		Close,
		CloseOk,
		SaveAndClose,
		Reload,
		Refresh,
		Requery,
		Save,
		Create,
		Clear,
		Open,
		OpenSelected,
		OpenSelectedFrame,
		DbRemoveSelected,
		DbRemove,
		Append,
		Prepend,
		Browse,
		Execute,
		ExecuteSelected,
		Remove,
		RemoveSelected,
		Dialog,
		Select,
		SelectChecked,
		Report,
		Export,
		MailTo,
		Navigate,
		NavigateExternal,
		Download,
		Attachment,
		Help,
		EUSign,
		ExportTo,
		File,
		Print
	}

	public enum DialogAction
	{
		Unknown,
		Edit,
		EditSelected,
		Show,
		ShowSelected,
		Browse,
		Append, // create in dialog and append to array,
		New, // create in dialog and update selected in array;
		Copy
	}

	public enum FileAction
	{
		Unknown,
		Show,
		Download,
		Print
	}

	public enum ExportToFormat
	{
		Pdf,
		Excel,
		Word,
		OpenText,
		OpenSheet
	}

	public enum Permission
	{
		None = 0,
		CanView = 1,
		CanEdit = 2,
		CanDelete = 4,
		CanApply = 8,
		CanUnapply = 16,
	}

	//[DefaultProperty("Command")]
	public class BindCmd : BindBase
	{
		private const String nullString = "null";

		public CommandType Command { get; set; }
		public String Argument { get; set; }
		public String UpdateAfter { get; set; }
		public String Url { get; set; }
		public DialogAction Action { get; set; }
		public FileAction FileAction { get; set; }

		public String Execute { get; set; }
		public String CommandName { get; set; }
		public String Report { get; set; }

		public Boolean SaveRequired { get; set; }
		public Boolean ValidRequired { get; set; }
		public Boolean CheckReadOnly { get; set; }
		public Boolean NewWindow { get; set; }
		public Boolean CheckArgument { get; set; }
		public Boolean Export { get; set; }
		public Boolean Print { get; set; }
		public Boolean ReloadAfter { get; set; }

		public Confirm Confirm { get; set; }
		public Toast Toast { get; set; }

		public String Data { get; set; }

		public ExportToFormat Format { get; set; }
		public String FileName { get; set; }

		public Permission Permission { get; set; }

		public BindCmd()
		{

		}
		public BindCmd(String command)
		{
			if (command == null)
				return;
			if (!Enum.TryParse<CommandType>(command, out CommandType cmdType))
				throw new XamlException($"Invalid command '{command}'");
			Command = cmdType;
		}

		internal String GetHrefForCommand(RenderContext context)
		{
			switch (Command)
			{
				case CommandType.Open:
					return $"$href({CommandUrl(context)}, {CommandArgument(context)})";
				case CommandType.MailTo:
					return $"$mailto({CommandArgument(context)}, {GetData(context)})";
				case CommandType.Help:
					return $"$helpHref({CommandUrl(context)})";
				case CommandType.NavigateExternal:
					return $"{CommandUrl(context, decorate: false, skipCheck: true)}";
			}
			return null;
		}

		internal String NewWindowJS => NewWindow.ToString().ToLowerInvariant();

		Boolean IsIndirectSupported
		{
			get
			{
				return Command == CommandType.Open || Command == CommandType.Remove ||
					Command == CommandType.Execute || Command == CommandType.Dialog;
			}
		}

		internal String GetCommand(RenderContext context, Boolean indirect = false, String argument = null, XamlElement src = null)
		{
			if (indirect)
			{
				if (!IsIndirectSupported)
					throw new XamlException($"Command '{Command}' is not available in this context");
			}
			switch (Command)
			{
				case CommandType.Unknown:
					throw new NotImplementedException($"Command required for BindCmd extension");
				case CommandType.Refresh:
				case CommandType.Reload:
					return $"$reload({CommandArgument(context, nullable: true)})";

				case CommandType.Requery:
					return "$requery()";

				case CommandType.Save:
					return $"$save({{toast: {GetToast(context)}, options:{GetOptionsValid(context)}}})";

				case CommandType.Clear:
					return $"{CommandArgument(context)}.$empty()";

				case CommandType.Close:
					if (src != null) {
						var inlineModal = src.FindParent<InlineDialog>();
						if (inlineModal != null)
						return $"$inlineClose('{inlineModal.Id}', false)";
					}
					return context.IsDialog ? "$modalClose(false)" : "$close()";

				case CommandType.CloseOk:
					return context.IsDialog ? "$modalClose(true)" : throw new XamlException("The command 'CloseOk' is allowed for Dialogs only");

				case CommandType.SaveAndClose:
					if (context.IsDialog)
						return $"$modalSaveAndClose(true, {GetOptionsValid(context)})";
					return $"$saveAndClose({{toast: {GetToast(context)}}})";

				case CommandType.OpenSelected:
					return $"$openSelected({CommandUrl(context, decorate: true)}, {CommandArgument(context)}, {NewWindowJS}, {UpdateAfterArgument(context)})";

				case CommandType.OpenSelectedFrame:
					return $"$openSelectedFrame({CommandUrl(context, decorate: true)}, {CommandArgument(context)}, {UpdateAfterArgument(context)})";

				case CommandType.Select:
					return $"$modalSelect({CommandArgument(context)}, {GetOptionsValid(context)})";

				case CommandType.SelectChecked:
					return $"$modalSelectChecked({CommandArgument(context)})";

				case CommandType.RemoveSelected:
					return $"$removeSelected({CommandArgument(context)}, {GetConfirm(context)})";

				case CommandType.DbRemove:
					return $"$dbRemove({CommandArgument(context)}, {GetConfirm(context)}, {GetOptions(context)})";

				case CommandType.DbRemoveSelected:
					return $"$dbRemoveSelected({CommandArgument(context)}, {GetConfirm(context)}, {GetOptions(context)})";

				case CommandType.MailTo:
					return null;

				case CommandType.Navigate:
					return $"$navigateSimple({CommandUrl(context)}, {NewWindowJS})";

				case CommandType.NavigateExternal:
					return $"$navigateExternal({CommandUrl(context, decorate:false, skipCheck:true)}, {NewWindowJS})";

				case CommandType.Download:
					return $"$download({CommandUrl(context)})";

				case CommandType.Attachment:
					return $"$attachment({CommandUrl(context)}, {CommandArgument(context)}, {GetOptions(context)})";

				case CommandType.Help:
					return $"$showHelp({CommandUrl(context)})";

				case CommandType.Print:
					return $"$print()";

				case CommandType.Open:
					if (indirect)
					{
						var argSting = "this";
						if (!IsArgumentEmpty(context))
							argSting = CommandArgument(context);
						// arg4 may contain a single quote!!!
						return $"{{cmd:$navigate, eval: true, arg1:{CommandUrl(context, true)}, arg2:'{argSting}', arg3:{NewWindowJS}, arg4:{UpdateAfterArgument(context)}}}";
					}
					else
						return $"$navigate({CommandUrl(context)}, {CommandArgument(context)}, {NewWindowJS}, {UpdateAfterArgument(context)})";

				case CommandType.Create:
					return $"$navigate({CommandUrl(context)}, {CommandArgument(context, nullable:true)}, {NewWindowJS}, {UpdateAfterArgument(context)}, {GetOptions(context)})";

				case CommandType.Remove:
					if (indirect)
						return $"{{cmd:$remove, arg1:'this'}}";
					else
						return $"$remove({CommandArgumentOrThis(context)}, {GetConfirm(context)})";

				case CommandType.Append:
					return $"{CommandArgument(context)}.$append()";

				case CommandType.Prepend:
					return $"{CommandArgument(context)}.$prepend()";

				case CommandType.Browse:
					return $"$dialog('browse', {CommandUrl(context)}, {CommandArgument(context)}, {GetData(context)})";

				case CommandType.Execute:
					if (indirect)
					{
						var arg2 = IsArgumentEmpty(context) ? "this" : CommandArgument(context);
						return $"{{cmd:$exec, arg1:'{GetName()}', arg2:'{arg2}', arg3: {GetConfirm(context)}, arg4: {GetOptions(context)}}}";
					}
					if (argument != null)
						return $"$exec('{GetName()}', {argument}, {GetConfirm(context)}, {GetOptions(context)})";
					return $"$exec('{GetName()}', {CommandArgument(context, nullable: true)}, {GetConfirm(context)}, {GetOptions(context)})";

				case CommandType.ExecuteSelected:
					return $"$execSelected('{GetName()}', {CommandArgument(context)}, {GetConfirm(context)})";

				case CommandType.Report:
					return $"$report({GetReportName(context)}, {CommandArgument(context, nullable: true)}, " +
						$"{GetOptions(context)}, {CommandUrlOptional(context)}, {GetData(context)})";

				case CommandType.Export:
					return $"$export({CommandArgument(context, nullable:true)}, {CommandUrlOptional(context)}, {GetData(context)}, {GetOptions(context)})";

				case CommandType.ExportTo:
					return $"$exportTo('{Format}', {CommandFileName(context)})";

				case CommandType.File:
					return $"$file({CommandUrl(context)}, {CommandArgument(context)}, {GetOptionsForFile(context)})";

				case CommandType.Dialog:
					if (Action == DialogAction.Unknown)
						throw new XamlException($"Action required for {Command} command");
					String action = Action.ToString().ToKebabCase();
					Boolean bNullable = false;
					if (Action == DialogAction.Show)
						bNullable = true; // Nullable actions ???
					if (indirect)
					{
						String arg3 = "this";
						if (!IsArgumentEmpty(context))
							arg3 = CommandArgument(context);
						// command, url, data
						return $"{{cmd:$dialog, isDialog:true, arg1:'{action}', arg2:{CommandUrl(context, decorate:true)}, arg3: '{arg3}'}}";
					}
					return $"$dialog('{action}', {CommandUrl(context)}, {CommandArgument(context, bNullable)}, {GetData(context, func:true)}, {GetOptions(context)})";
				case CommandType.EUSign:
					return $"$eusign({CommandUrl(context)}, {CommandArgument(context)})";
				default:
					throw new NotImplementedException($"command '{Command}' yet not implemented");
			}
		}
		String GetName()
		{
			if (String.IsNullOrEmpty(CommandName))
				throw new XamlException($"'CommandName' is required for '{Command}' command");
			return CommandName;
		}

		String GetReportName(RenderContext context)
		{
			var repBind = GetBinding(nameof(Report));
			if (repBind != null)
				return repBind.GetPathFormat(context);
			else if (String.IsNullOrEmpty(Report))
				throw new XamlException($"'Report' is required for '{Command}' command");
			return $"'{Report}'";
		}

		String GetOptions(RenderContext context)
		{
			if (!SaveRequired && !ValidRequired && !CheckReadOnly && !Export && !Print && !NewWindow 
				&& !CheckArgument && !ReloadAfter && Permission == Permission.None)
				return nullString;
			StringBuilder sb = new StringBuilder("{");
			if (SaveRequired)
				sb.Append("saveRequired: true,");
			if (ValidRequired)
				sb.Append("validRequired: true,");
			if (CheckReadOnly)
				sb.Append("checkReadOnly: true,");
			if (CheckArgument)
				sb.Append("checkArgument: true,");
			if (Permission != Permission.None)
				sb.Append($"checkPermission: '{Permission.ToString().ToCamelCase()}'");
			if (Export)
			{
				sb.Append("export: true,");
				sb.Append($"format: '{Format.ToString().ToLowerInvariant()}',");
			}
			else if (Print)
				sb.Append("print: true,");
			if (NewWindow)
				sb.Append("newWindow: true,");
			if (ReloadAfter)
				sb.Append("reloadAfter: true,");
			sb.RemoveTailComma();
			sb.Append("}");
			return sb.ToString();
		}

		String GetOptionsForFile(RenderContext context)
		{
			if (FileAction == FileAction.Unknown)
				return nullString;
			return $"{{action: '{FileAction.ToString().ToLowerInvariant()}'}}";
		}

		String GetOptionsValid(RenderContext context)
		{
			if (!ValidRequired)
				return nullString;
			StringBuilder sb = new StringBuilder("{");
			if (ValidRequired)
			{
				sb.Append("validRequired: true, ");
			}
			sb.RemoveTailComma();
			sb.Append("}");
			return sb.ToString();
		}

		String UpdateAfterArgument(RenderContext context)
		{
			if (!NewWindow) return nullString;
			var uaBind = GetBinding(nameof(UpdateAfter));
			if (uaBind != null)
				return uaBind.GetPath(context);
			return nullString;
		}

		String CommandArgument(RenderContext context, Boolean nullable = false)
		{
			String arg = null;
			if (Argument != null)
				return $"'{Argument}'";
			if (nullable)
			{
				var argBind = GetBinding(nameof(Argument));
				if (argBind != null)
					arg = argBind.GetPath(context);
			}
			else
				arg = ArgumentBinding.GetPath(context);
			if (String.IsNullOrEmpty(arg))
				return nullString;
			return arg;
		}

		String GetData(RenderContext context, Boolean func = false)
		{
			var dataBind = GetBinding(nameof(Data));
			if (dataBind != null)
			{
				if (func)
					return $"()=>{dataBind.GetPath(context)}"; // FUNCTION!!!
				return dataBind.GetPath(context);
			}
			else if (Data != null)
				return $"'{Data}'";
			return nullString;
		}

		String GetConfirm(RenderContext context)
		{
			if (Confirm == null)
				return nullString;
			return Confirm.GetJsValue(context);
		}

		String GetToast(RenderContext context)
		{
			if (Toast == null)
				return nullString;
			return Toast.GetJsValue(context);
		}

		Boolean IsArgumentEmpty(RenderContext context)
		{
			var argBind = GetBinding(nameof(Argument));
			return argBind == null || String.IsNullOrEmpty(argBind.Path);

		}

		String CommandArgumentOrThis(RenderContext context)
		{
			var argBind = GetBinding(nameof(Argument));
			if (argBind != null)
				return argBind.GetPath(context);
			var path = context.GetNormalizedPath(String.Empty);
			if (String.IsNullOrEmpty(path))
				throw new XamlException($"Invalid arguments for {Command} command");
			return path;
		}

		Bind ArgumentBinding
		{
			get
			{
				var arg = GetBinding(nameof(Argument));
				if (arg != null)
					return arg;
				throw new XamlException($"Argument bind required for {Command} command");
			}
		}

		String CommandFileName(RenderContext context, Boolean decorate = false)
		{
			var fnBind = GetBinding(nameof(FileName));
			if (fnBind != null)
			{
				if (decorate)
					return $"'{{{fnBind.Path}}}'";
				return fnBind.GetPath(context);
			}
			return $"'{context.Localize(FileName)}'";
		}

		String CommandUrlOptional(RenderContext context)
		{
			var urlBind = GetBinding(nameof(Url));
			if (urlBind != null)
				return urlBind.GetPath(context);
			else if (String.IsNullOrEmpty(Url))
				return nullString;
			if (!Url.StartsWith("/"))
				throw new NotImplementedException($"Url '{Url}' must start with '/'");
			return $"'{Url}'";
		}

		String CommandUrl(RenderContext context, Boolean decorate = false, Boolean skipCheck = false)
		{
			var urlBind = GetBinding(nameof(Url));
			if (urlBind != null)
			{
				if (decorate)
					return $"'{{{urlBind.Path}}}'";
				return urlBind.GetPath(context);
			}
			if (String.IsNullOrEmpty(Url))
				throw new NotImplementedException($"Url required for {Command} command");
			// TODO: check URL format
			if (!skipCheck)
			{
				if (!Url.StartsWith("/"))
					throw new NotImplementedException($"Url '{Url}' must start with '/'");
			}
			return $"'{Url}'";
		}

		internal void MergeDisabled(TagBuilder tag, String disabledVal)
		{
			var existingDisabled = tag.GetAttribute(":disabled");
			if (!String.IsNullOrEmpty(existingDisabled))
				disabledVal = $"{existingDisabled} || {disabledVal}";
			tag.MergeAttribute(":disabled", disabledVal, replaceExisting:true);
		}

		internal void MergeCommandAttributes(TagBuilder tag, RenderContext context)
		{
			switch (Command)
			{
				case CommandType.Open:
				case CommandType.Report:
					if (CheckArgument) {
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!({arg.GetPath(context)})", replaceExisting:true);
					} else if (CheckReadOnly)
						tag.MergeAttribute(":disabled", $"$isReadOnly({GetOptions(context)})", replaceExisting:true);
					break;
				case CommandType.Create:
					if (CheckReadOnly)
						tag.MergeAttribute(":disabled", $"$isReadOnly({GetOptions(context)})", replaceExisting:true);
					break;
				case CommandType.Save:
				case CommandType.SaveAndClose:
					if (context.IsDataModelIsReadOnly)
						tag.MergeAttribute(":disabled", "true", replaceExisting:true);
					else
						tag.MergeAttribute(":disabled", "!$canSave", replaceExisting:true);
					break;
				case CommandType.Execute:
					MergeDisabled(tag, $"!$canExecute('{CommandName}', {CommandArgument(context, true)}, {GetOptions(context)})");
					break;
				case CommandType.Append:
				case CommandType.Prepend:
				case CommandType.Remove:
					if (context.IsDataModelIsReadOnly)
						tag.MergeAttribute(":disabled", "true", replaceExisting:true);
					break;
				case CommandType.SelectChecked:
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasChecked({arg.GetPath(context)})", replaceExisting:true);
					}
					break;
				case CommandType.OpenSelected:
				case CommandType.OpenSelectedFrame:
				case CommandType.Select:
				case CommandType.ExecuteSelected:
				case CommandType.DbRemoveSelected:
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)}, {GetOptionsValid(context)})", replaceExisting:true);
					}
					break;
				case CommandType.RemoveSelected:
					if (context.IsDataModelIsReadOnly)
						tag.MergeAttribute(":disabled", "true", replaceExisting:true);
					else
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)})", replaceExisting:true);
					}
					break;
				case CommandType.Dialog:
					if (Action == DialogAction.EditSelected || Action == DialogAction.ShowSelected)
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)})", replaceExisting:true);
					}
					else if (CheckArgument)
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!({arg.GetPath(context)})", replaceExisting:true);
					}
					break;
				case CommandType.Clear:
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute("v-if", $"!({arg.GetPath(context)}.$isEmpty)", replaceExisting:true);
						}
					break;
			}
		}

		internal Boolean IsSkipCheckReadOnly()
		{
			if (CheckReadOnly)
				return false; // always disable readonly commands
			switch (Command)
			{
				case CommandType.Close:
				case CommandType.Refresh:
				case CommandType.Reload:
				case CommandType.Export:
				case CommandType.Report:
				case CommandType.Requery:
				case CommandType.MailTo:
				case CommandType.Help:
				case CommandType.Print:
				case CommandType.Execute:
				case CommandType.ExecuteSelected:
					return true;
			}
			return false;
		}
	}
}
