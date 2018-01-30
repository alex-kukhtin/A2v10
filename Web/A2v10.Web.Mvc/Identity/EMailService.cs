// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Net.Mail;
using System.Threading.Tasks;

using Microsoft.AspNet.Identity;

namespace A2v10.Web.Mvc.Identity
{
    class EmailService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            using (var client = new SmtpClient())
            {
                using (var mm = new MailMessage())
                {
                    mm.To.Add(new MailAddress(message.Destination));
                    mm.Subject = message.Subject;
                    mm.Body = message.Body;
                    mm.IsBodyHtml = true;
                    // sync variant. avoid exception loss
                    client.Send(mm);
                }
            }
            return Task.FromResult(0);
        }
    }
}
