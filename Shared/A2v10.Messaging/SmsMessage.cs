// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;

using System.Windows.Markup;

namespace A2v10.Messaging
{
    [ContentProperty("Message")]
    public class SmsMessage : TemplatedMessage
    {
        public String Phone { get; set; }
        public String Message { get; set; }
        public String ExternalId { get; set; }

        public async override Task<IMessageForSend> ResolveAndSendAsync(MessageResolver resolver)
        {
            return new SmsMessageForSend(
                await resolver.ResolveAsync(this, Phone),
                await resolver.ResolveAsync(this, Message),
                await resolver.ResolveAsync(this, ExternalId)
            );
        }
    }
}
