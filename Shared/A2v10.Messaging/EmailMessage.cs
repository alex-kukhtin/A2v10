// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading.Tasks;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	[ContentProperty("Body")]
	public class EmailMessage : TemplatedMessage, IMessageForSend
	{
		public String Subject { get; set; }
		public String Body { get; set; }
		public String BodyTemplate { get; set; }
		public Boolean IsBodyHtml { get; set; }

		public MessageAddress From { get; set; }
		public MessageAddressCollection To { get; set; } = new MessageAddressCollection();
		public MessageAddressCollection CC { get; set; } = new MessageAddressCollection();
		public MessageAddressCollection Bcc { get; set; } = new MessageAddressCollection();

		public MessageAttachmentCollection Attachments { get; set; } = new MessageAttachmentCollection();

		public async override Task<IMessageForSend> ResolveAndSendAsync(MessageResolver resolver)
		{
			var nm = new EmailMessage()
			{
				Subject = await resolver.ResolveAsync(this, Subject),
				Body = await resolver.ResolveAsync(this, Body),
				BodyTemplate = await resolver.ResolveAsync(this, BodyTemplate)
			};
			await nm.LoadBodyTemplate(this, resolver);
			nm.To = await ResolveCollectionAsync(To, resolver);
			nm.Bcc = await ResolveCollectionAsync(Bcc, resolver);
			nm.CC = await ResolveCollectionAsync(CC, resolver);
			if (From != null)
				nm.From = new MessageAddress(await resolver.ResolveAsync(this, From.Address), await resolver.ResolveAsync(this, From.DisplayName));
			if (Attachments != null && Attachments.Count != 0)
				foreach (var att in Attachments)
				{
					var ratt = await ResolveAttachmentAsync(att, resolver);
					if (ratt.Stream != null)
						nm.Attachments.Add(ratt);
				}
			return nm;
		}

		async Task<MessageAttachment> ResolveAttachmentAsync(MessageAttachment att, MessageResolver resolver)
		{
			var ma = new MessageAttachment()
			{
				Name = (await resolver.ResolveAsync(this, att.Name))?.Trim(),
				Mime = (await resolver.ResolveAsync(this, att.Mime))?.Trim(),
				Stream = await resolver.ResolveStreamAsync(this, att.Data)
			};
			return ma;
		}

		async Task<MessageAddressCollection> ResolveCollectionAsync(MessageAddressCollection coll, MessageResolver resolver)
		{
			var newColl = new MessageAddressCollection();
			foreach (var addr in coll)
			{
				var na = new MessageAddress(
					await resolver.ResolveAsync(this, addr.Address), 
					await resolver.ResolveAsync(this, addr.DisplayName));
				newColl.Add(na);
			}
			return newColl;
		}

		public async Task SendAsync(IMessageService emailService)
		{
			var info = emailService.CreateSendInfo();
			info.Subject = Subject;
			info.Body = Body;
			foreach (var t in To)
				info.AddTo(t.Address, t.DisplayName);
			foreach (var c in CC)
				info.AddCC(c.Address, c.DisplayName);
			foreach (var b in Bcc)
				info.AddBcc(b.Address, b.DisplayName);
			if (Attachments != null)
				foreach (var a in Attachments)
				{
					info.AddAttachment(a.Stream, a.Name, a.Mime);
				}
			await emailService.SendAsync(info);
		}

		async Task LoadBodyTemplate(EmailMessage msg, MessageResolver resolver)
		{
			if (String.IsNullOrEmpty(BodyTemplate))
				return;
			String text = await resolver.ResolveFileAsync(msg, BodyTemplate);
			if (text != null)
				Body = text;
		}
	}
}
