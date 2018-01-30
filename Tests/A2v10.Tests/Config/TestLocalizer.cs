// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Tests.Config
{
    public class TestLocalizer : ILocalizer
    {
        public String Localize(String locale, String content, Boolean replaceNewLine = true)
        {
            return content;
        }
    }
}
