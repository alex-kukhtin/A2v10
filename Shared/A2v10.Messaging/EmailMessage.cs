// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

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
			return nm;
		}

		async Task<MessageAddressCollection> ResolveCollectionAsync(MessageAddressCollection coll, MessageResolver resolver)
		{
			var newColl = new MessageAddressCollection();
			foreach (var addr in coll)
			{
				var na = new MessageAddress(await resolver.ResolveAsync(this, addr.Address), await resolver.ResolveAsync(this, addr.DisplayName));
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
