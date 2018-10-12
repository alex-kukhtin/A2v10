// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Text;

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
		Help
	}

	public enum DialogAction
	{
		Unknown,
		Edit,
		EditSelected,
		Show,
		Browse,
		Append, // create in dialog and append to array,
		Copy
	}

	public class BindCmd : BindBase
	{
		private const String nullString = "null";

		public CommandType Command { get; set; }
		public String Argument { get; set; }
		public String UpdateAfter { get; set; }
		public String Url { get; set; }
		public DialogAction Action { get; set; }

		public String Execute { get; set; }
		public String CommandName { get; set; }
		public String Report { get; set; }

		public Boolean SaveRequired { get; set; }
		public Boolean ValidRequired { get; set; }
		public Boolean CheckReadOnly { get; set; }
		public Boolean NewWindow { get; set; }
		public Boolean CheckArgument { get; set; }
		public Boolean Export { get; set; }
		public Boolean ReloadAfter { get; set; }

		public Confirm Confirm { get; set; }
		public Toast Toast { get; set; }

		public String Data { get; set; }

		public BindCmd()
		{

		}
		public BindCmd(String command)
		{
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
					return $"{CommandUrl(context, decorate:false, skipCheck:true)}";
			}
			return null;
		}

		internal String NewWindowJS => NewWindow.ToString().ToLowerInvariant();

		internal String GetCommand(RenderContext context, Boolean indirect = false, String argument = null)
		{
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
					return context.IsDialog ? "$modalClose()" : "$close()";

				case CommandType.CloseOk:
					return context.IsDialog ? "$modalClose(true)" : throw new XamlException("The command 'CloseOk' is allowed for Dialogs only");

				case CommandType.SaveAndClose:
					if (context.IsDialog)
						return $"$modalSaveAndClose(null, {GetOptionsValid(context)})";
					return $"$saveAndClose({{toast: {GetToast(context)}}})";

				case CommandType.OpenSelected:
					return $"$openSelected({CommandUrl(context, decorate: true)}, {CommandArgument(context)}, {NewWindowJS}, {UpdateAfterArgument(context)})";


				case CommandType.Select:
					return $"$modalSelect({CommandArgument(context)}, {GetOptionsValid(context)})";

				case CommandType.SelectChecked:
					return $"$modalSelectChecked({CommandArgument(context)})";

				case CommandType.RemoveSelected:
					return $"$removeSelected({CommandArgument(context)}, {GetConfirm(context)})";

				case CommandType.DbRemove:
					return $"$dbRemove({CommandArgument(context)}, {GetConfirm(context)})";

				case CommandType.DbRemoveSelected:
					return $"$dbRemoveSelected({CommandArgument(context)}, {GetConfirm(context)})";


				case CommandType.MailTo:
					return null;

				case CommandType.Navigate:
					return $"$navigateSimple({CommandUrl(context)}, {NewWindowJS})";

				case CommandType.NavigateExternal:
					return $"$navigateExternal({CommandUrl(context, decorate:false, skipCheck:true)}, {NewWindowJS})";

				case CommandType.Download:
					return $"$download({CommandUrl(context)})";

				case CommandType.Help:
					return $"$showHelp({CommandUrl(context)})";

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
						if (!IsArgumentEmpty(context))
							return $"{{cmd:$exec, arg1:'{GetName()}', arg2:'{CommandArgument(context)}'}}";
						return $"{{cmd:$exec, arg1:'{GetName()}', arg2:'this'}}";
					}
					if (argument != null)
						return $"$exec('{GetName()}', {argument}, {GetConfirm(context)}, {GetOptions(context)})";
					return $"$exec('{GetName()}', {CommandArgument(context, nullable: true)}, {GetConfirm(context)}, {GetOptions(context)})";

				case CommandType.ExecuteSelected:
					return $"$execSelected('{GetName()}', {CommandArgument(context)}, {GetConfirm(context)})";

				case CommandType.Report:
					return $"$report('{GetReportName()}', {CommandArgument(context, nullable: true)}, {GetOptions(context)})";

				case CommandType.Export:
					return $"$export()";

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
					return $"$dialog('{action}', {CommandUrl(context)}, {CommandArgument(context, bNullable)}, {GetData(context)}, {GetOptions(context)})";

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

		String GetReportName()
		{
			if (String.IsNullOrEmpty(Report))
				throw new XamlException($"'Report' is required for '{Command}' command");
			return Report;
		}

		String GetOptions(RenderContext context)
		{
			if (!SaveRequired && !ValidRequired && !CheckReadOnly && !Export && !CheckArgument && !ReloadAfter)
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
			if (Export)
				sb.Append("export: true,");
			if (ReloadAfter)
				sb.Append("reloadAfter: true,");
			sb.RemoveTailComma();
			sb.Append("}");
			return sb.ToString();
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

		String GetData(RenderContext context)
		{
			var dataBind = GetBinding(nameof(Data));
			if (dataBind != null)
				return dataBind.GetPath(context);
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
			return $"'{Url.ToLowerInvariant()}'";
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
							tag.MergeAttribute(":disabled", $"!({arg.GetPath(context)})");
					} else if (CheckReadOnly)
						tag.MergeAttribute(":disabled", $"$isReadOnly({GetOptions(context)})");
					break;
				case CommandType.Create:
					if (CheckReadOnly)
						tag.MergeAttribute(":disabled", $"$isReadOnly({GetOptions(context)})");
					break;
				case CommandType.Save:
				case CommandType.SaveAndClose:
					if (context.IsDataModelIsReadOnly)
						tag.MergeAttribute(":disabled", "true");
					else
						tag.MergeAttribute(":disabled", "!$canSave");
					break;
				case CommandType.Execute:
					tag.MergeAttribute(":disabled", $"!$canExecute('{CommandName}', {CommandArgument(context, true)}, {GetOptions(context)})");
					break;
				case CommandType.Append:
				case CommandType.Prepend:
				case CommandType.Remove:
					if (context.IsDataModelIsReadOnly)
						tag.MergeAttribute(":disabled", "true");
					break;
				case CommandType.SelectChecked:
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasChecked({arg.GetPath(context)})");
					}
					break;
				case CommandType.OpenSelected:
				case CommandType.Select:
				case CommandType.ExecuteSelected:
				case CommandType.DbRemoveSelected:
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)}, {GetOptionsValid(context)})");
					}
					break;
				case CommandType.RemoveSelected:
					if (context.IsDataModelIsReadOnly)
						tag.MergeAttribute(":disabled", "true");
					else
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)})");
					}
					break;
				case CommandType.Dialog:
					if (Action == DialogAction.EditSelected)
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)})");
					}
					else if (CheckArgument)
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute(":disabled", $"!({arg.GetPath(context)})");
					}
					break;
				case CommandType.Clear:
					{
						var arg = GetBinding(nameof(Argument));
						if (arg != null)
							tag.MergeAttribute("v-if", $"!({arg.GetPath(context)}.$isEmpty)");
						}
					break;
			}
		}
	}
}
