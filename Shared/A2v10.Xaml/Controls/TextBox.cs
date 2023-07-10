// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public enum UpdateTrigger
{
    Default,
    Blur,
    Input
}

public class TextBox : ValuedControl, ITableControl
{
    public String Placeholder { get; set; }

    public Int32? Rows { get; set; }

    public Boolean Password { get; set; }
    public Boolean Number { get; set; }
    public Boolean AutoSize { get; set; }
    public Boolean Multiline { get; set; }
    public TextAlign Align { get; set; }
    public UpdateTrigger UpdateTrigger { get; set; }
    public Boolean? SpellCheck { get; set; }
    public Length MaxHeight { get; set; }

    public Bind EnterCommand { get; set; }

    public Accel Accel { get; set; }
    public Boolean ShowClear { get; set; }
    public Boolean ShowFilter { get; set; }
    public Boolean ShowSearch { get; set; }

    protected virtual String TagName => Multiline ? "a2-textarea" : "textbox";

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
    {
        if (CheckDisabledModel(context))
            return;
        var input = new TagBuilder(TagName, null, IsInGrid);
        onRender?.Invoke(input);
        MergeAttributes(input, context);
        MergeDisabled(input, context);
        SetSize(input, nameof(TextBox));
        if (Multiline)
            MergeAttributeInt32(input, context, "rows", nameof(Rows), Rows);
        if (Password)
            input.MergeAttribute(":password", "true");
        if (Number)
            input.MergeAttribute(":number", "true");
        if (AutoSize)
            input.MergeAttribute(":auto-size", "true");
        if (UpdateTrigger != UpdateTrigger.Default)
            input.MergeAttribute("update-trigger", UpdateTrigger.ToString().ToLowerInvariant());
        if (SpellCheck != null)
            input.MergeAttribute(":spell-check", SpellCheck.Value.ToString().ToLowerInvariant());
        if (MaxHeight != null)
            input.MergeAttribute("max-height", MaxHeight.Value);

        if (Accel != null)
            input.MergeAttribute("accel", Accel.GetKeyCode());


        var enterCmd = GetBindingCommand(nameof(EnterCommand));
        if (enterCmd != null)
            input.MergeAttribute(":enter-command", $"() => {enterCmd.GetCommand(context)}"); // FUNCTION!!!
        if (ShowClear)
            input.MergeAttribute(":has-clear", "true");
        if (ShowFilter)
            input.MergeAttribute(":has-filter", "true");
        if (ShowSearch)
            input.MergeAttribute(":has-search", "true");
        MergeAlign(input, context, Align);
        MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
        MergeValue(input, context);
        input.RenderStart(context);
        RenderAddOns(context);
        input.RenderEnd(context);
    }

    protected override void OnEndInit()
    {
        base.OnEndInit();
        if (UpdateTrigger == UpdateTrigger.Input)
        {
            var valBind = GetBinding(nameof(Value));
            if (valBind != null && !String.IsNullOrEmpty(valBind.Mask))
                throw new XamlException("TextBox. UpdateTrigger='Input' is not compatible with the Masked input future");
        }
    }
}
