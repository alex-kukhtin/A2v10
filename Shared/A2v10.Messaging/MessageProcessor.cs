// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

using A2v10.Infrastructure;
using System.Collections.Generic;
using A2v10.Data.Interfaces;

namespace A2v10.Messaging
{
	public class MessageProcessor : IMessaging
	{
		readonly private IApplicationHost _host;
		readonly private IDbContext _dbContext;

		public MessageProcessor(IApplicationHost host, IDbContext dbContext)
		{
			_host = host;
			_dbContext = dbContext;
		}

		public IMessage CreateMessage()
		{
			return new CommonMessage();

		}
		public void QueueMessage(IMessage message)
		{
			String json = JsonConvert.SerializeObject(message);
			ExpandoObject msg = JsonConvert.DeserializeObject<ExpandoObject>(json, new ExpandoObjectConverter());
			ConvertToNameValueArray(msg, "Params");
			ConvertToNameValueArray(msg, "Environment");
			_dbContext.SaveModel(String.Empty, "a2msg.[Message.Queue]", msg);
		}

		void ConvertToNameValueArray(ExpandoObject msg, String name)
		{
			if (!(msg.Get<ExpandoObject>(name) is IDictionary<String, Object> val))
				return;
			var arr = new List<Object>();
			foreach (var v in val)
			{
				var ne = new ExpandoObject();
				ne.Set("Name", v.Key);
				ne.Set("Value", v.Value);
				arr.Add(ne);
			}
			msg.Set(name, arr);
		}
	}
}
