// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Net.Mail;
using System.Net.Mime;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

using Microsoft.AspNet.Identity;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using A2v10.Messaging;

namespace A2v10.Web.Identity
{
	public class IdentityEmailService : EmailService, IIdentityMessageService
	{
		public IdentityEmailService(ILogger logger)
			: base(logger)
		{

		}

		public Task SendAsync(IdentityMessage message)
		{
			Send(message.Destination, message.Subject, message.Body);
			return Task.FromResult(0);
		}

	}
}
