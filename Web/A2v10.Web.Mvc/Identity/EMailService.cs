// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Net.Mail;
using System.Threading.Tasks;
using A2v10.Infrastructure;
using Microsoft.AspNet.Identity;
using Newtonsoft.Json;

namespace A2v10.Web.Mvc.Identity
{
	class EmailService : IIdentityMessageService
	{
		private readonly ILogger _logger;
		public EmailService(ILogger logger)
		{
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
		}

		String GetJsonResult(String phase, String destination, String result = null, String message = null)
		{
			var r = new
			{
				sendmail = new
				{
					phase,
					destination,
					result,
					message
				}
			};

			return JsonConvert.SerializeObject(r, new JsonSerializerSettings()
			{
				NullValueHandling = NullValueHandling.Ignore
			});
		}

		public Task SendAsync(IdentityMessage message)
		{
			try
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
						_logger.LogMessaging(GetJsonResult("send", message.Destination));
						client.Send(mm);
						_logger.LogMessaging(GetJsonResult("result", message.Destination, "success"));
					}
				}
			}
			catch (Exception ex)
			{
				String msg = ex.Message;
				if (ex.InnerException != null)
					msg = ex.InnerException.Message;
				_logger.LogMessaging(new LogEntry(LogSeverity.Error, GetJsonResult("result", message.Destination, "exception", msg)));
				throw; // rethrow
			}
			return Task.FromResult(0);
		}
	}
}
