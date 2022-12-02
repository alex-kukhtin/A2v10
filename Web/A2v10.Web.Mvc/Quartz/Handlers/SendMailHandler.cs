// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Net.Mail;
using System.Net;
using System.Net.Mime;
using System.Text;

using Quartz;

using A2v10.Messaging;
using A2v10.Data.Interfaces;

namespace A2v10.Web.Mvc.Quartz;

internal class SendMailHandler : IJobHandler
{
	private readonly CommandJobData _job;
	private readonly IDbContext _dbContext;
	internal SendMailHandler(CommandJobData job, IServiceProvider sp)
	{
		_job = job;
		_dbContext = sp.GetService(typeof(IDbContext)) as IDbContext;
	}
	public Task ProcessAsync(IJobExecutionContext context)
	{
		var ms = context.MergedJobDataMap["MailSettings"];
		if (ms is not SmtpConfig smtpConfig)
			throw new InvalidOperationException("There is no mail settings");

		using var client = new SmtpClient();
		client.DeliveryFormat = SmtpDeliveryFormat.International;
		Config(client, smtpConfig);

		using var mm = new MailMessage();
		mm.BodyTransferEncoding = TransferEncoding.Base64;
		mm.SubjectEncoding = Encoding.Unicode;
		mm.HeadersEncoding = Encoding.UTF8;
		mm.BodyEncoding = Encoding.UTF8;

		var msg = _job.GetObject<MailMessageInfo>();
		msg.ToMessage(mm, smtpConfig);
		client.Send(mm);
		return Task.CompletedTask;
	}

	private void Config(SmtpClient client, SmtpConfig config)
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
}
