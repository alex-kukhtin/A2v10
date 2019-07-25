// Copyright © 2012-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Net;
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
		private readonly IApplicationHost _host;

		public EmailService(ILogger logger, IApplicationHost host)
		{
			_logger = logger ?? throw new ArgumentNullException(nameof(logger));
			_host = host ?? throw new ArgumentNullException(nameof(host));
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

		SmtpConfig GetCurrentConfig()
		{
			var strConfig = _host.SmtpConfig;
			if (String.IsNullOrEmpty(strConfig))
				return null;
			return SmtpConfig.FromJson(strConfig);
		}

		void SetParameters(SmtpClient client, SmtpConfig config)
		{
			if (config == null)
				return;
			client.DeliveryMethod = config.deliveryMethod;
			client.PickupDirectoryLocation = config.pickupDirectoryLocation;
			client.Host = config.host;
			client.Port = config.port;
			client.EnableSsl = config.enableSsl;
			// credentials
			client.Credentials = new NetworkCredential(config.userName, config.password);
		}

		public async Task SendAsync(String to, String subject, String body)
		{
			try
			{
				using (var client = new SmtpClient())
				{
					client.DeliveryFormat = SmtpDeliveryFormat.International;
					var config = GetCurrentConfig();
					SetParameters(client, config);
					using (var mm = new MailMessage())
					{
						if (config != null && !String.IsNullOrEmpty(config.from))
							mm.From = new MailAddress(config.from);
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
						// avoid SmtpClient deadlock 
						await Task.Run(() => client.Send(mm));
						//await client.SendMailAsync(mm);
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
