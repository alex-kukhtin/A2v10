// Copyright © 2024-2025 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class InlineTextBox : ValuedControl, ITableControl
{
    public String Placeholder { get; set; }
    public TextAlign Align { get; set; }
    public Bind EnterCommand { get; set; }
    public String EditTip { get; set; }
    public Length MinWidth { get; set; }
    public Length MaxWidth { get; set; }

    public override void RenderElement(RenderContext context, Action<TagBuilder> onRender = null)
    {
        if (CheckDisabledModel(context))
            return;
        var input = new TagBuilder("a2-edit-inline", null, IsInGrid);
        onRender?.Invoke(input);
        MergeAttributes(input, context);
        MergeDisabled(input, context);
        SetSize(input, nameof(InlineTextBox));

        var enterCmd = GetBindingCommand(nameof(EnterCommand));
        if (enterCmd != null)
            input.MergeAttribute(":enter-command", $"() => {enterCmd.GetCommand(context)}"); // FUNCTION!!!

        if (MinWidth != null)
            input.MergeStyle("min-width", MinWidth.Value);

        if (MaxWidth != null)
            input.MergeStyle("max-width", MaxWidth.Value);

        MergeAlign(input, context, Align);
        MergeValue(input, context);
        input.MergeAttribute("edit-tip", EditTip);
        MergeBindingAttributeString(input, context, "placeholder", nameof(Placeholder), Placeholder);
        input.Render(context);
    }

    protected override void OnEndInit()
    {
        base.OnEndInit();
    }
}
