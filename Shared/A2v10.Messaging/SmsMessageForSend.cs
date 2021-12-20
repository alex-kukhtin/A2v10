
using System;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Messaging
{
    public class SmsMessageForSend : IMessageForSend
    {
        public SmsMessageForSend(String phone, String message, String extId)
        {
            Phone = phone;
            Message = message;
            ExternalId = extId;
        }

        public String Phone { get; }
        public String Message { get; }
        public String ExternalId { get; }

        public Task SendAsync(IMessageService emailService, ISmsService smsService)
        {
            var extId = ExternalId;
            if (String.IsNullOrEmpty(extId))
                extId = Guid.NewGuid().ToString();
            return smsService.SendSmsAsync(Phone, Message, extId);
        }
    }
}
