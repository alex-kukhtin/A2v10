// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Configuration;
using System.Runtime.CompilerServices;

namespace A2v10.BackgroundTasks
{
#pragma warning disable IDE1006 // Naming Styles
	public class A2ConfigurationElement : ConfigurationElement
	{
		protected T _get<T>([CallerMemberName] String propName = null)
		{
			return (T)this[propName];
		}
		protected void _set<T>(T value, [CallerMemberName] String propName = null)
		{
			this[propName] = value;
		}

	}

	public class BackgroundTaskElement : A2ConfigurationElement
	{

		[ConfigurationProperty("name", IsKey = true, IsRequired = true)]
		public String name
		{
			get { return _get<String>(); }
			set { _set<String>(value); }
		}

		[ConfigurationProperty("type", IsRequired = true)]
		public String type
		{
			get { return _get<String>(); }
			set { _set<String>(value); }
		}

		[ConfigurationProperty("count")]
		public Int32 count
		{
			get { return _get<Int32>(); }
			set { _set<Int32>(count); }
		}

		[ConfigurationProperty("interval")]
		public TimeSpan interval
		{
			get { return _get<TimeSpan>(); }
			set { _set<TimeSpan>(value); }
		}

		[ConfigurationProperty("parameter")]
		public String parameter
		{
			get { return _get<String>(); }
			set { _set<String>(value); }
		}

		[ConfigurationProperty("batch")]
		public Boolean batch
		{
			get { return _get<Boolean>(); }
			set { _set<Boolean>(value); }
		}

		[ConfigurationProperty("priority")]
		public Int32? priority
		{
			get { return _get<Int32?>(); }
			set { _set<Int32?>(value); }
		}
	}

	public class BackgroundTasksSection : ConfigurationSection
	{
		[ConfigurationProperty("", IsDefaultCollection = true)]
		public BackgroundTasksCollection tasks
		{
			get
			{
				return (BackgroundTasksCollection)base[String.Empty];
			}
		}
	}

	[ConfigurationCollection(typeof(BackgroundTaskElement), AddItemName = "task", CollectionType = ConfigurationElementCollectionType.BasicMap)]
	public class BackgroundTasksCollection : ConfigurationElementCollection
	{
		protected override ConfigurationElement CreateNewElement()
		{
			return new BackgroundTaskElement();
		}

		protected override Object GetElementKey(ConfigurationElement element)
		{
			return ((BackgroundTaskElement)element).name;
		}

		public BackgroundTaskElement GetTask(String key)
		{
			return (BackgroundTaskElement)BaseGet(key);
		}
	}
#pragma warning restore IDE1006 // Naming Styles
}
