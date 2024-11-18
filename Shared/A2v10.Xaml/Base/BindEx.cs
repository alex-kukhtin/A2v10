// Copyright © 2024 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Xaml;

public class BindSum : Bind
{
    public BindSum(String path)
        : base(path)
    {
        DataType = DataType.Currency;
        HideZeros = true;
        NegativeRed = true;
    }
}

public class BindNumber : Bind
{
    public BindNumber(String path)
        : base(path)
    {
        DataType = DataType.Number;
        HideZeros = true;
        NegativeRed = true;
    }
}

public class BindCmdExec : BindCmd
{
    public BindCmdExec(String path)
        : base()
    {
        Command = CommandType.Execute;
        CommandName = path;
    }
}
