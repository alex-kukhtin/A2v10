// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using A2v10.Messaging;
using System;
using System.Net.Mail;
using System.Reflection;
using System.Text;

namespace A2v10.Web.Mvc.Quartz;

internal class MessageAddress
{
	String Address { get; set; }
	String DisplayName { get; set; }
}

internal class MailMessageInfo
{
	public String subject { get; set; }
	public String body { get; set; }
	public String to { get; set; }

	public String from { get; set; }

	public void ToMessage(MailMessage mm, SmtpConfig config)
	{
		mm.Body = body;
		mm.Subject = subject;
		mm.To.Add(new MailAddress(to));
		mm.From = new MailAddress(from ?? config.from);
		HackSubjectEncoding(mm, mm.Subject);
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
}
