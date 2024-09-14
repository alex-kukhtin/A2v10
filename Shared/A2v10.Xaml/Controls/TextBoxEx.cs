// Copyright © 2024 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class TextBoxBindNum : TextBox
{
    public String Bind { get; set; } = default!;
    protected override void OnEndInit()
    {
        base.OnEndInit();
        if (Align == TextAlign.Default)
            Align = TextAlign.Right;

        SetBinding(nameof(TextBox.Value), new Bind(Bind)
        {
            DataType = DataType.Number,
            HideZeros = true,
            NegativeRed = true,
        });
    }
}

public class TextBoxBindSum : TextBox
{
    public String Bind { get; set; } = default!;
    protected override void OnEndInit()
    {
        base.OnEndInit();

        if (Align == TextAlign.Default)
            Align = TextAlign.Right;

        SetBinding(nameof(TextBox.Value), new Bind(Bind)
        {
            DataType = DataType.Currency,
            NegativeRed = true,
            HideZeros = true,
        });
    }
}

