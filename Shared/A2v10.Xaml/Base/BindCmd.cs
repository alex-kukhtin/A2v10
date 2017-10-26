
using A2v10.Infrastructure;
using System;
using System.Reflection;
using System.Windows.Markup;

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
        public CommandType Command { get; set; }
        public String Argument { get; set; }
        public String Url { get; set; }
        public DialogAction Action { get; set; }

        public String Execute { get; set; }
        public String CommandName { get; set; }
        public String Report { get; set; }

        public Confirm Confirm { get; set; }

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
                        return "$modalSaveAndClose()";
                    return "$saveAndClose()";

                case CommandType.OpenSelected:
                    return $"$openSelected('{CommandUrl}', {CommandArgument(context)})";


                case CommandType.Select:
                    return $"$modalSelect({CommandArgument(context)})";

                case CommandType.RemoveSelected:
                    return $"$removeSelected({CommandArgument(context)} {GetConfirm(context)})";

                case CommandType.DbRemoveSelected:
                    return $"$dbRemoveSelected({CommandArgument(context)} {GetConfirm(context)})";

                case CommandType.Open:
                    if (indirect)
                    {
                        if (!IsArgumentEmpty(context))
                            return $"{{cmd:$navigate, eval: true, arg1:'{CommandUrl}', arg2:'{CommandArgument(context)}'}}";
                        return $"{{cmd:$navigate, eval:true, arg1:'{CommandUrl}', arg2:'this'}}";
                    }
                    else
                        return $"$navigate('{CommandUrl}', {CommandArgument(context)})";
                case CommandType.Create:
                    return $"$navigate('{CommandUrl}')";

                case CommandType.Remove:
                    if (indirect)
                    {
                        return $"{{cmd:$remove, arg1:'this'}}";
                    }
                    else
                        return $"$remove({CommandArgumentOrThis(context)} {GetConfirm(context)})";

                case CommandType.Append:
                    return $"{CommandArgument(context)}.$append()";

                case CommandType.Browse:
                    return $"$dialog('browse', '{CommandUrl}', {CommandArgument(context)})";

                case CommandType.Execute:
                    return $"$exec('{GetName()}', {CommandArgument(context, nullable:true)} {GetConfirm(context)})";

                case CommandType.ExecuteSelected:
                    return $"$execSelected('{GetName()}', {CommandArgument(context)} {GetConfirm(context)})";
                case CommandType.Report:
                    return $"$report('{GetReportName()}', {CommandArgument(context, nullable:true)})";
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
                        return $"{{cmd:$dialog, arg1:'{action}', arg2:'{CommandUrl}', arg3: '{arg3}'}}";
                    }
                    return $"$dialog('{action}', '{CommandUrl}', {CommandArgument(context, bNullable)})";

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
                return "null";
            return arg;
        }

        String GetConfirm(RenderContext context)
        {
            if (Confirm == null)
                return String.Empty;
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

        String CommandUrl
        {
            get
            {
                var urlBind = GetBinding(nameof(Url));
                if (urlBind != null)
                {
                    return $"{{{urlBind.Path}}}";
                }
                if (String.IsNullOrEmpty(Url))
                    throw new NotImplementedException($"Url required for {Command} command");
                // TODO: check URL format
                if (!Url.StartsWith("/"))
                    throw new NotImplementedException($"Url '{Url}' must start with '/'");
                return Url.ToLowerInvariant();
            }
        }

        internal void MergeCommandAttributes(TagBuilder tag, RenderContext context)
        {
            switch (Command)
            {
                case CommandType.Save:
                case CommandType.SaveAndClose:
                    tag.MergeAttribute(":disabled", "$isPristine");
                    break;
                case CommandType.Execute:
                    tag.MergeAttribute(":disabled", $"!$canExecute('{CommandName}', {CommandArgument(context, true)})");
                    break;
                case CommandType.OpenSelected:
                case CommandType.Select:
                case CommandType.ExecuteSelected:
                case CommandType.DbRemoveSelected:
                case CommandType.RemoveSelected:
                    {
                        var arg = GetBinding(nameof(Argument));
                        if (arg != null)
                            tag.MergeAttribute(":disabled", $"!$hasSelected({arg.GetPath(context)})");
                        break;
                    }
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
