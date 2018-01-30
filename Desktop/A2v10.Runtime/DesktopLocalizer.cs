// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Runtime
{
    public class DesktopLocalizer : ILocalizer
    {
        public String Localize(String locale, String content, Boolean replaceNewLine = true)
        {
            return content;
        }
    }
}
