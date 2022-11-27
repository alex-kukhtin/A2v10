// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

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
	public String Subject { get; set; }
	public String Body { get; set; }

	public void ToMessage(MailMessage mm)
	{
		mm.Body = Body;
		mm.Subject = Subject;
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
