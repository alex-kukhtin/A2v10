// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	public class AttachementForSend : IMessageAttachment
	{
		public String Name { get; set; }
		public String Mime { get; set; }
		public Stream Stream { get; set; }
	}

	public class EmailMessageForSend : IMessageForSend
	{
		public String Subject { get; set; }
		public String Body { get; set; }

		public MessageAddressCollection To { get; set; }
		public MessageAddressCollection CC { get; set; }
		public MessageAddressCollection Bcc { get; set; }

		public MessageAddress From { get; set; }

		public List<AttachementForSend> Attachments { get; set; } = new List<AttachementForSend>();

		public async Task SendAsync(IMessageService emailService, ISmsService smsService)
		{
			var info = emailService.CreateSendInfo();
			info.Subject = Subject;
			info.Body = Body;
			if (From != null)
				info.SetFrom(From.Address, From.DisplayName);
			if (To != null)
				foreach (var t in To)
					info.AddTo(t.Address, t.DisplayName);
			if (CC != null)
				foreach (var c in CC)
					info.AddCC(c.Address, c.DisplayName);
			if (Bcc != null)
				foreach (var b in Bcc)
					info.AddBcc(b.Address, b.DisplayName);
			if (Attachments != null)
				foreach (var a in Attachments)
					info.AddAttachment(a.Stream, a.Name, a.Mime);
			await emailService.SendAsync(info);
		}
	}
}
