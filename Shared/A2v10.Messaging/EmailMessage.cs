// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows.Markup;

using A2v10.Infrastructure;

namespace A2v10.Messaging
{
	[ContentProperty("Body")]
	public class EmailMessage : TemplatedMessage
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
		public MessageReportCollection Reports { get; set; } = new MessageReportCollection();

		public async override Task<IMessageForSend> ResolveAndSendAsync(MessageResolver resolver)
		{
			var nm = new EmailMessageForSend()
			{
				Subject = await resolver.ResolveAsync(this, Subject),
				Body = await resolver.ResolveAsync(this, Body),
			};
			var body = await LoadBodyTemplate(this, resolver);
			if (body != null)
				nm.Body = body;
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
			if (Reports != null && Reports.Count != 0)
				foreach (var rep in Reports)
				{
					var ratt = await ResolveReportAsync(rep, resolver);
					if (ratt.Stream != null)
						nm.Attachments.Add(ratt);
				}
			return nm;
		}

		async Task<AttachementForSend> ResolveAttachmentAsync(MessageAttachment att, MessageResolver resolver)
		{
			var ma = new AttachementForSend()
			{
				Name = (await resolver.ResolveAsync(this, att.Name))?.Trim(),
				Mime = (await resolver.ResolveAsync(this, att.Mime))?.Trim(),
				Stream = await resolver.ResolveStreamAsync(this, att.Data)
			};
			return ma;
		}

		async Task<AttachementForSend> ResolveReportAsync(MessageReport rep, MessageResolver resolver)
		{
			var repName = await resolver.ResolveAsync(this, rep.Name);
			if (repName == null)
				repName = "report";
			repName = Path.ChangeExtension(repName.Trim(), ".pdf");
			var ma = new AttachementForSend()
			{
				Name = repName,
				Mime = MimeTypes.Application.Pdf,
				Stream = await resolver.ResolveReportAsync(this, rep)
			};
			return ma;
		}

		async Task<MessageAddressCollection> ResolveCollectionAsync(MessageAddressCollection coll, MessageResolver resolver)
		{
			if (coll == null || coll.Count == 0)
				return null;
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


		async Task<String> LoadBodyTemplate(EmailMessage msg, MessageResolver resolver)
		{
			if (String.IsNullOrEmpty(BodyTemplate))
				return null;
			String text = await resolver.ResolveFileAsync(msg, BodyTemplate);
			return text;
		}
	}
}
