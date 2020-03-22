// Copyright © 2020 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;

namespace A2v10.Web.Mvc.OAuth2
{
#pragma warning disable IDE1006 // Naming Styles
	public class Oauth2Section : ConfigurationSection
	{
		[ConfigurationProperty(nameof(clients))]
		public ClientsCollection clients => (ClientsCollection)base[nameof(clients)];

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

	[ConfigurationCollection(typeof(ClientElement), AddItemName = "client", CollectionType = ConfigurationElementCollectionType.BasicMap)]
	public class ClientsCollection : ConfigurationElementCollection
	{
		protected override ConfigurationElement CreateNewElement()
		{
			return new ClientElement();
		}

		protected override Object GetElementKey(ConfigurationElement element)
		{
			return ((ClientElement)element).id;
		}

		public ClientElement GetSource(String key)
		{
			return (ClientElement)BaseGet(key);
		}
	}

	public class ClientElement : ConfigurationElement
	{
		[ConfigurationProperty(nameof(id), IsKey = true, IsRequired = true)]
		public String id
		{
			get { return (String)this[nameof(id)]; }
			set { this[nameof(id)] = value; }
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

		[ConfigurationProperty(nameof(allowIp), IsRequired = true)]
		public String allowIp
		{
			get { return (String)this[nameof(allowIp)]; }
			set { this[nameof(allowIp)] = value; }
		}

		[ConfigurationProperty(nameof(allowOrigin), IsRequired = true)]
		public String allowOrigin
		{
			get { return (String)this[nameof(allowOrigin)]; }
			set { this[nameof(allowOrigin)] = value; }
		}

		[ConfigurationProperty(nameof(url), IsRequired = true)]
		public String url
		{
			get { return (String)this[nameof(url)]; }
			set { this[nameof(url)] = value; }
		}
	}
#pragma warning restore IDE1006 // Naming Styles
}
