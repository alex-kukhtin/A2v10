// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System.Threading.Tasks;

using Microsoft.AspNet.Identity;

using A2v10.Infrastructure;
using A2v10.Messaging;

namespace A2v10.Web.Identity
{
	public class IdentityEmailService : EmailService, IIdentityMessageService
	{
		public IdentityEmailService(ILogger logger, IApplicationHost host)
			: base(logger, host)
		{
		}

		public Task SendAsync(IdentityMessage message)
		{
			return SendAsync(message.Destination, message.Subject, message.Body);
		}
	}
}
