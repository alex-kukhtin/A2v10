// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Net.Mail;

namespace A2v10.Messaging
{
	/*
	from:
	<mailSettings>
		<smtp from="from@domain.com" deliveryMethod="SpecifiedPickupDirectory" deliveryFormat="International">
			<specifiedPickupDirectory pickupDirectoryLocation="c:\pickup" />
			<network host="mail.domain.com" port="111" userName="userName" password="userPassword" enableSsl="false" />
		</smtp>
	<mailSettings>

	to:
	<appSettings>
		<add key="smtpConfig" value="{from:'from@domain.com', host:'mail.domain.com', port:'111', userName:'userName', password:'userPassword', enableSsl:'true',  deliveryMethod: 'SpecifiedPickupDirectory', pickupDirectoryLocation: 'c:\pickup'}" />
	</appSettings>
	 */
	public class SmtpConfig
	{
#pragma warning disable IDE1006 // Naming Styles
		public String from;
		public SmtpDeliveryMethod deliveryMethod {get;set;}
		public String pickupDirectoryLocation { get; set; }
		public Int32 port { get; set; }
		public String host { get; set; }
		public Boolean enableSsl { get; set; }
		public String userName { get; set; }
		public String password { get; set; }
#pragma warning restore IDE1006 // Naming Styles
	}
}
