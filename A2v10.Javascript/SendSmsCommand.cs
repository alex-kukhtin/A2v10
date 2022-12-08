// Copyright © 2019-2022 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Javascript;

public class SendSmsResponse
{
#pragma warning disable IDE1006 // Naming Styles
	public Boolean success { get; set; } = true;
#pragma warning restore IDE1006 // Naming Styles
}

public class SendSmsCommand
{
    private readonly ISmsService _smsService;
    public SendSmsCommand(ISmsService smsService)
    {
        _smsService = smsService;
    }
    public SendSmsResponse Execute(String phone, String message, String extId)
    {
        extId ??= Guid.NewGuid().ToString();
        _smsService.SendSms(phone, message, extId);
        return new SendSmsResponse();
    }
}
