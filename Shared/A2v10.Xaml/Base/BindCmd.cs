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
        Browse,
        Execute,
        ExecuteSelected,
        Remove,
        RemoveSelected,
        Dialog,
        Select,
        Report,
    }

    public enum DialogAction
    {
        Unknown,
        Edit,
        EditSelected,
        Show,
        Browse,
        Append, // create in dialog and append to array
    }


    public class BindCmd : BindBase
    {
        private const String nullString = "null";

        public CommandType Command { get; set; }
        public String Argument { get; set; }
        public String Url { get; set; }
        public DialogAction Action { get; set; }

        public String Execute { get; set; }
        public String CommandName { get; set; }
        public String Report { get; set; }

        public Boolean SaveRequired { get; set; }
        public Boolean ValidRequired { get; set; }
        public Boolean CheckReadOnly { get; set; }

        public Confirm Confirm { get; set; }

        public String Data { get; set; }

        public BindCmd()
        {

        }
        public BindCmd(String command)
        {
            CommandType cmdType;
            if (!Enum.TryParse<CommandType>(command, out cmdType))
                throw new XamlException($"Invalid command '{command}'");
            Command = cmdType;
        }

        internal String GetCommand(RenderContext context, Boolean indirect = false)
        {
            switch (Command)
            {
                case CommandType.Unknown:
                    throw new NotImplementedException($"Command required for BindCmd extension");
                case CommandType.Refresh:
                case CommandType.Reload:
                    return "$reload()";

                case CommandType.Requery:
                    return "$requery()";

                case CommandType.Save:
                    return "$save()";

                case CommandType.Clear:
                    return $"{CommandArgument(context)}.$empty()";

                case CommandType.Close:
                    return context.IsDialog ? "$modalClose()" : "$close()";

                case CommandType.SaveAndClose:
                    if (context.IsDialog)
                        return $"$modalSaveAndClose(null, {GetOptionsValid(context)})";
                    return "$saveAndClose()";

                case CommandType.OpenSelected:
                    return $"$openSelected({CommandUrl(context, decorate:true)}, {CommandArgument(context)})";


                case CommandType.Select:
                    return $"$modalSelect({CommandArgument(context)})";

                case CommandType.RemoveSelected:
                    return $"$removeSelected({CommandArgument(context)}, {GetConfirm(context)})";

                case CommandType.DbRemove:
                    return $"$dbRemove({CommandArgument(context)}, {GetConfirm(context)})";

                case CommandType.DbRemoveSelected:
                    return $"$dbRemoveSelected({CommandArgument(context)}, {GetConfirm(context)})";

                case CommandType.Open:
                    if (indirect)
                    {
                        if (!IsArgumentEmpty(context))
                            return $"{{cmd:$navigate, eval: true, arg1:{CommandUrl(context, true)}, arg2:'{CommandArgument(context)}'}}";
                        return $"{{cmd:$navigate, eval: true, arg1:{CommandUrl(context, true)}, arg2:'this'}}";
                    }
                    else
                        return $"$navigate({CommandUrl(context)}, {CommandArgument(context)})";
                case CommandType.Create:
                    return $"$navigate({CommandUrl(context)})";

                case CommandType.Remove:
                    if (indirect)
                    {
                        return $"{{cmd:$remove, arg1:'this'}}";
                    }
                    else
                        return $"$remove({CommandArgumentOrThis(context)}, {GetConfirm(context)})";

                case CommandType.Append:
                    return $"{CommandArgument(context)}.$append()";

                case CommandType.Browse:
                    return $"$dialog('browse', {CommandUrl(context)}, {CommandArgument(context)}, {GetData(context)})";

                case CommandType.Execute:
                    return $"$exec('{GetName()}', {CommandArgument(context, nullable:true)}, {GetConfirm(context)}, {GetOptions(context)})";

                case CommandType.ExecuteSelected:
                    return $"$execSelected('{GetName()}', {CommandArgument(context)}, {GetConfirm(context)})";

                case CommandType.Report:
                    return $"$report('{GetReportName()}', {CommandArgument(context, nullable:true)}, {GetOptions(context)})";

                case CommandType.Dialog:
                    if (Action == DialogAction.Unknown)
                        throw new XamlException($"Action required for {Command} command");
                    String action = Action.ToString().ToKebabCase();
                    bool bNullable = false;
                    if (Action == DialogAction.Show)
                        bNullable = true; // Nullable actions ???
                    if (indirect)
                    {
                        String arg3 = "this";
                        if (!IsArgumentEmpty(context))
                            arg3 = CommandArgument(context);
                        // command, url, data
                        return $"{{cmd:$dialog, arg1:'{action}', arg2:{CommandUrl(context)}, arg3: '{arg3}'}}";
                    }
                    return $"$dialog('{action}', {CommandUrl(context)}, {CommandArgument(context, bNullable)}, {GetData(context)}, {GetOptions(context)})";

                default:
                    throw new NotImplementedException($"command '{Command}' yet not implemented");
            }
        }
        String GetName()
        {
            if (String.IsNullOrEmpty(CommandName))
                throw new XamlException($"CommandName required for {Command} command");
            return CommandName;
        }

        String GetReportName()
        {
            if (String.IsNullOrEmpty(Report))
                throw new XamlException($"ReportName required for {Command} command");
            return Report;
        }

        String GetOptions(RenderContext context)
        {
            if (!SaveRequired && !ValidRequired && !CheckReadOnly)
                return nullString;
            StringBuilder sb = new StringBuilder("{");
            if (SaveRequired)
                sb.Append("saveRequired: true,");
            if (ValidRequired)
                sb.Append("validRequired: true,");
            if (CheckReadOnly)
                sb.Append("checkReadOnly: true,");
            sb.RemoveTailComma();
            sb.Append("}");
            return sb.ToString();
        }

        String GetOptionsValid(RenderContext context)
        {
            if (!ValidRequired)
                return String.Empty;
            StringBuilder sb = new StringBuilder("{");
            if (ValidRequired)
            {
                sb.Append("validRequired: true, ");
            }
            sb.RemoveTailComma();
            sb.Append("}");
            return sb.ToString();
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
                return Data;
            return nullString;
        }

        String GetConfirm(RenderContext context)
        {
            if (Confirm == null)
                return nullString;
            return Confirm.GetJsValue(context);
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

        String CommandUrl(RenderContext context, Boolean decorate = false)
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
            if (!Url.StartsWith("/"))
                throw new NotImplementedException($"Url '{Url}' must start with '/'");
            return $"'{Url.ToLowerInvariant()}'";
        }

        internal void MergeCommandAttributes(TagBuilder tag, RenderContext context)
        {
            switch (Command)
            {
                case CommandType.Save:
                case CommandType.SaveAndClose:
                    if (context.IsDataModelIsReadOnly)
                        tag.MergeAttribute(":disabled", "true");
                    else
                        tag.MergeAttribute(":disabled", "$isPristine");
                    break;
                case CommandType.Execute:
                    tag.MergeAttribute(":disabled", $"!$canExecute('{CommandName}', {CommandArgument(context, true)}, {GetOptions(context)})");
                    break;
                case CommandType.Append:
                case CommandType.Remove:
                    if (context.IsDataModelIsReadOnly)
                        tag.MergeAttribute(":disabled", "true");
                    break;
                case CommandType.OpenSelected:
                case CommandType.Select:
                case CommandType.ExecuteSelected:
                case CommandType.DbRemoveSelected:
                    {
                        var arg = GetBinding(nameof(Argument));
                        if (arg != null)
                            tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)})");
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
                    break;
            }
        }
    }
}
