// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Windows.Markup;

namespace A2v10.Messaging
{
    [ContentProperty("Text")]
    public class SmsMessage : TemplatedMessage
    {
        public String Text { get; set; }

        public override Task<IMessageForSend> ResolveAndSendAsync(MessageResolver resolver)
        {
            throw new NotImplementedException();
        }
    }
}
