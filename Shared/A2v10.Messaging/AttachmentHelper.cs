// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;

/* from here:
-- https://social.msdn.microsoft.com/Forums/en-US/b6c764f7-4697-4394-b45f-128a24306d55/40-smtpclientsend-attachments-mit-umlauten-im-dateinamen?forum=dotnetframeworkde
*/

namespace A2v10.Messaging
{
	public class AttachmentHelper
	{
		public static Attachment CreateAttachment(Stream stream, String displayName, ContentType contentType)
		{
			Attachment attachment = new Attachment(stream, contentType);

			String tranferEncodingMarker = "B";
			String encodingMarker = "UTF-8";
			Int32 maxChunkLength = 30;

			attachment.NameEncoding = Encoding.UTF8;

			string encodingtoken = String.Format("=?{0}?{1}?", encodingMarker, tranferEncodingMarker);
			string softbreak = "?=";
			string encodedAttachmentName = encodingtoken;

			encodedAttachmentName = Convert.ToBase64String(Encoding.UTF8.GetBytes(displayName));

			encodedAttachmentName = SplitEncodedAttachmentName(encodingtoken, softbreak, maxChunkLength, encodedAttachmentName);
			attachment.Name = encodedAttachmentName;

			return attachment;
		}

		private static String SplitEncodedAttachmentName(String encodingtoken, String softbreak, Int32 maxChunkLength, string encoded)
		{
			int splitLength = maxChunkLength - encodingtoken.Length - (softbreak.Length * 2);
			var parts = SplitByLength(encoded, splitLength);

			string encodedAttachmentName = encodingtoken;

			foreach (var part in parts)
				encodedAttachmentName += part + softbreak + encodingtoken;

			encodedAttachmentName = encodedAttachmentName.Remove(encodedAttachmentName.Length - encodingtoken.Length, encodingtoken.Length);
			return encodedAttachmentName;
		}

		private static IEnumerable<String> SplitByLength(String stringToSplit, Int32 length)
		{
			while (stringToSplit.Length > length)
			{
				yield return stringToSplit.Substring(0, length);
				stringToSplit = stringToSplit.Substring(length);
			}

			if (stringToSplit.Length > 0)
				yield return stringToSplit;
		}
	}
}
