// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Net.Mail;
using System.Net.Mime;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using A2v10.Infrastructure;

using Newtonsoft.Json;

namespace A2v10.Messaging
{
	public class EmailService : IMessageService
	{
		private readonly ILogger _logger;

		public EmailService(ILogger logger)
		{
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
		}

		void HackSubjectEncoding(MailMessage mm, String subject)
		{
			var msgPI = mm.GetType().GetField("message", BindingFlags.Instance | BindingFlags.NonPublic);
			if (msgPI == null) return;
			Object msg = msgPI.GetValue(mm);
			if (msg == null) return;
			var subjPI = msg.GetType().GetField("subject", BindingFlags.Instance | BindingFlags.NonPublic);
			if (subjPI == null) return;
			// without line breaks!
			String encodedSubject = Convert.ToBase64String(Encoding.UTF8.GetBytes(subject), Base64FormattingOptions.None);
			String subjString = $"=?UTF-8?B?{encodedSubject}?=";
			subjPI.SetValue(msg, subjString);
		}

		public async Task SendAsync(String to, String subject, String body)
		{
			try
			{
				using (var client = new SmtpClient())
				{
					client.DeliveryFormat = SmtpDeliveryFormat.International;
					using (var mm = new MailMessage())
					{
						mm.To.Add(new MailAddress(to));
						mm.BodyTransferEncoding = TransferEncoding.Base64;
						mm.SubjectEncoding = Encoding.Unicode;
						mm.HeadersEncoding = Encoding.UTF8;
						mm.BodyEncoding = Encoding.UTF8;

						mm.Subject = subject;
						HackSubjectEncoding(mm, subject);

						mm.Body = body;

						mm.IsBodyHtml = true;

						//????
						//var av = AlternateView.CreateAlternateViewFromString(body, Encoding.UTF8, "text/html");
						//mm.AlternateViews.Add(av);

						// sync variant. avoid exception loss
						_logger.LogMessaging(GetJsonResult("send", to));
						await client.SendMailAsync(mm);
						_logger.LogMessaging(GetJsonResult("result", to, "success"));
					}
				}
			}
			catch (Exception ex)
			{
				LogException(to, ex);
				throw; // rethrow
			}
		}

		void LogException(String to, Exception ex)
		{
			if (ex.InnerException != null)
				ex = ex.InnerException;
			var msg = GetJsonResult("result", to, "exception", ex.Message);
			_logger.LogMessagingError(msg);
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
	}
}
