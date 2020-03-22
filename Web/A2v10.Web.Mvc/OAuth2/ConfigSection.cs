// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;

namespace A2v10.Web.Mvc.OAuth2
{
	public class Oauth2Section : ConfigurationSection
	{
		[ConfigurationProperty(nameof(servers))]
		public ServersCollection servers => (ServersCollection)base[nameof(servers)];

		[ConfigurationProperty(nameof(tokenEndpoint), IsRequired = true)]
		public String tokenEndpoint
		{
			get { return (String)this[nameof(tokenEndpoint)]; }
			set { this[nameof(tokenEndpoint)] = value; }
		}
		[ConfigurationProperty(nameof(allowInsecureHttp))]
		public Boolean allowInsecureHttp
		{
			get { return (Boolean)this[nameof(allowInsecureHttp)]; }
			set { this[nameof(allowInsecureHttp)] = value; }
		}
		[ConfigurationProperty(nameof(expireTimeSpan))]
		public TimeSpan expireTimeSpan
		{
			get { return (TimeSpan)this[nameof(expireTimeSpan)]; }
			set { this[nameof(expireTimeSpan)] = value; }
		}

	}

	[ConfigurationCollection(typeof(ServerElement), AddItemName = "server", CollectionType = ConfigurationElementCollectionType.BasicMap)]
	public class ServersCollection : ConfigurationElementCollection
	{
		protected override ConfigurationElement CreateNewElement()
		{
			return new ServerElement();
		}

		protected override Object GetElementKey(ConfigurationElement element)
		{
			return ((ServerElement)element).clientId;
		}

		public ServerElement GetSource(String key)
		{
			return (ServerElement)BaseGet(key);
		}
	}

	public class ServerElement : ConfigurationElement
	{
		[ConfigurationProperty(nameof(clientId), IsKey = true, IsRequired = true)]
		public String clientId
		{
			get { return (String)this[nameof(clientId)]; }
			set { this[nameof(clientId)] = value; }
		}

		[ConfigurationProperty(nameof(key), IsRequired = true)]
		public String key
		{
			get { return (String)this[nameof(key)]; }
			set { this[nameof(key)] = value; }
		}

		[ConfigurationProperty(nameof(vector), IsRequired = true)]
		public String vector
		{
			get { return (String)this[nameof(vector)]; }
			set { this[nameof(vector)] = value; }
		}
	}
}
