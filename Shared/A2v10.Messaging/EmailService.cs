// Copyright © 2012-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Linq;
using System.Collections.Generic;
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

		public IMessageSendInfo CreateSendInfo()
		{
			return new MessageSendInfo();
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

		void SetAddress(IEnumerable<IMessageAddress> to, MailAddressCollection coll)
		{
			if (to == null)
				return;
			foreach (var ma in to)
			{
				var abs = ma.Address.Trim();
				if (!String.IsNullOrEmpty(abs))
				{
					if (abs.Contains(';'))
					{
						foreach (var x in abs.Split(';'))
							coll.Add(new MailAddress(x.Trim()));
					}
					else
						coll.Add(new MailAddress(abs, ma.DisplayName));
				}
			}
		}

		public async Task SendAsync(IMessageSendInfo info)
		{
			String toAsString = String.Join(";", info.To.Select(x => x.Address));
			try
			{
				using (var client = new SmtpClient())
				{
					client.DeliveryFormat = SmtpDeliveryFormat.International;
					var config = GetCurrentConfig();
					SetParameters(client, config);
					using (var mm = new MailMessage())
					{
						if (info.From != null && !String.IsNullOrEmpty(info.From.Address))
							mm.From = new MailAddress(info.From.Address, info.From.DisplayName);
						else if (config != null && !String.IsNullOrEmpty(config.from))
							mm.From = new MailAddress(config.from);

						SetAddress(info.To, mm.To);
						SetAddress(info.CC, mm.CC);
						SetAddress(info.Bcc, mm.Bcc);

						mm.BodyTransferEncoding = TransferEncoding.Base64;
						mm.SubjectEncoding = Encoding.Unicode;
						mm.HeadersEncoding = Encoding.UTF8;
						mm.BodyEncoding = Encoding.UTF8;

						mm.Subject = info.Subject;
						HackSubjectEncoding(mm, info.Subject);

						mm.Body = info.Body;

						mm.IsBodyHtml = true;

						// attachments
						if (info.Attachments != null) {
							foreach (var att in info.Attachments)
							{
								//mm.Attachments.Add(new Attachment(att.Stream, new ContentType(att.Mime)));
								mm.Attachments.Add(
									AttachmentHelper.CreateAttachment(att.Stream, att.Name, new ContentType(att.Mime))
								);
								/*
									new Attachment(att.Stream, new ContentType(att.Mime))
									{
										Name = Convert.ToBase64String(Encoding.UTF8.GetBytes(att.Name))
									}
								);
								*/
							}
						}
						//????
						//var av = AlternateView.CreateAlternateViewFromString(body, Encoding.UTF8, "text/html");
						//mm.AlternateViews.Add(av);

						// sync variant. avoid exception loss
						_logger.LogMessaging(GetJsonResult("send", toAsString));
						// avoid SmtpClient deadlock 
						await Task.Run(() => client.Send(mm));
						//await client.SendMailAsync(mm);
						_logger.LogMessaging(GetJsonResult("result", toAsString, "success"));
					}
				}
			}
			catch (Exception ex)
			{
				LogException(toAsString, ex);
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
