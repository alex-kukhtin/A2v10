// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using A2v10.Infrastructure;

namespace A2v10.Messaging
{

	[TypeConverter(typeof(MessageAddressConverter))]
	public class MessageAddress : IMessageAddress
	{
		public String Address { get; set; }
		public String DisplayName { get; set; }

		public String Phone { get; set; }
		public AddressKind Kind { get; }

		public MessageAddress()
		{
		}

		public MessageAddress(String addr, String displayName = null)
		{
			Address = addr;
			DisplayName = displayName;
		}

	}

	[TypeConverter(typeof(MessageAddressCollectionConverter))]
	public class MessageAddressCollection : List<MessageAddress>
	{

	}

	public class MessageAddressConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(MessageAddress))
				return true;
			return false;
		}

		public override Object ConvertTo(ITypeDescriptorContext context, CultureInfo culture, Object value, Type destinationType)
		{
			if (value == null)
				return null;
			if (value is String)
			{
				String strVal = value.ToString();
				return new MessageAddress(strVal);
			}
			throw new MessagingException($"Invalid value '{value}' for MessageAddressConverter");
		}
	}

	public class MessageAddressCollectionConverter : TypeConverter
	{
		public override Boolean CanConvertFrom(ITypeDescriptorContext context, Type sourceType)
		{
			if (sourceType == typeof(String))
				return true;
			else if (sourceType == typeof(MessageAddress))
				return true;
			else if (sourceType == typeof(MessageAddressCollection))
				return true;
			return false;
		}

		public override Object ConvertFrom(ITypeDescriptorContext context, CultureInfo culture, Object value)
		{
			if (value == null)
				return null;
			var coll = new MessageAddressCollection();
			if (value is String)
			{
				String strVal = value.ToString();
				var ma = new MessageAddress(strVal);
				coll.Add(ma);
				return coll;
			}
			else if (value is MessageAddress)
			{
				coll.Add(value as MessageAddress);
				return coll;
			}
			else if (value is MessageAddressCollection)
				return value;
			throw new MessagingException($"Invalid value '{value}' for MessageAddressCollectionConverter");
		}
	}
}
