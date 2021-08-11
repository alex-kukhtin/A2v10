// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace A2v10.Infrastructure
{

	public interface IMessageSendInfo
	{
		String Subject { get; set; }
		String Body { get; set; }
		IEnumerable<IMessageAddress> To { get; }
		IEnumerable<IMessageAddress> CC { get; }
		IEnumerable<IMessageAddress> Bcc { get; }
		IEnumerable<IMessageAttachment> Attachments { get; }

		void AddTo(String address, String displayName = null);
		void AddCC(String address, String displayName = null);
		void AddBcc(String address, String displayName = null);
		void AddAttachment(Stream stream, String name, String mime);
	}

	public interface IMessageService
	{
		Task SendAsync(IMessageSendInfo info);
		IMessageSendInfo CreateSendInfo();
	}
}
