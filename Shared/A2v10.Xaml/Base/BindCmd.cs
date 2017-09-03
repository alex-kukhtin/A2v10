
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
        OpenSelected,
        Append,
        Browse,
        Exec
    }

    public class BindCmd : BindBase
    {
        public CommandType Command { get; set; }
        public String Argument { get; set; }
        public String Url { get; set; }

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

        internal String GetCommand(RenderContext context)
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

                case CommandType.Close:
                    return context.IsDialog ? "$modalClose()" : "$close()";

                case CommandType.SaveAndClose:
                    if (context.IsDialog)
                    {
                        var argsc = GetBinding(nameof(Argument));
                        if (argsc == null)
                            throw new NotImplementedException($"Argument bind required for dialog SaveAndClose command");
                        return $"$modalSaveAndClose({argsc.Path})";
                    }
                    return "$saveAndClose()";

                case CommandType.OpenSelected:
                    return $"$openSelected('{CommandUrl}', {ArgumentBinding.GetPath(context)})";

                case CommandType.Append:
                    return $"{ArgumentBinding.GetPath(context)}.$append()";

                case CommandType.Browse:
                    return $"$dialog('browse', '{CommandUrl}', {ArgumentBinding.GetPath(context)})";

                case CommandType.Exec:
                    return $"$exec('add100rows', Document)";

                default:
                    throw new NotImplementedException($"command '{Command}' yet not implemented");
            }
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
                if (String.IsNullOrEmpty(Url))
                    throw new NotImplementedException($"Url required for {Command} command");
                // TODO: check URL format
                if (!Url.StartsWith("/"))
                    throw new NotImplementedException("Url must start with '/'");
                return Url;
            }
        }

        internal void MergeCommandAttributes(TagBuilder tag)
        {
            switch (Command)
            {
                case CommandType.Save:
                case CommandType.SaveAndClose:
                    tag.MergeAttribute(":disabled", "$isPristine");
                    break;
                case CommandType.OpenSelected:
                    var arg = GetBinding(nameof(Argument));
                    if (arg != null)
                        tag.MergeAttribute(":disabled", $"!$hasSelected({arg.Path})");
                    break;
                    //tag.MergeAttribute(":disabled:")
            }
        }
    }
}
