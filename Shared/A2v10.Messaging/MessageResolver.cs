
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace A2v10.Messaging
{
	public class MessageResolver
	{
		private readonly IDbContext _dbContext;
		private readonly IDataModel _msgModel;
		private readonly IApplicationHost _host;
		private readonly ExpandoObject _msgParams;

		public MessageResolver(IApplicationHost host, IDbContext dbContext, IDataModel msgModel)
		{
			_host = host;
			_dbContext = dbContext;
			_msgModel = msgModel;
			if (_msgModel == null) return;
			_msgParams = new ExpandoObject();
			var trgId = msgModel.Eval<Int64>("Message.TargetId");
			if (trgId != 0)
				_msgParams.Set("TargetId", msgModel.Eval<Int64>("Message.TargetId"));
			var env = msgModel.Eval<List<ExpandoObject>>("Message.Environment");
			foreach (var e in env)
			{
				var key = e.Get<String>("Name");
				if (key == "Host")
					return;
				var val = e.Get<String>("Value");
				if (!String.IsNullOrEmpty(val))
					_msgParams.Set(key, val);
			}
		}

		public async Task<String> ResolveAsync(TemplatedMessage msg, String text)
		{
			if (text == null)
				return null;
			var sb = new StringBuilder(text);
			text = await ResolveDataModelAsync(msg, text);
			text = ResolveEnvironment(text);
			text = ResolveParameters(text);
			return text;
		}

		public async Task<String> ResolveDataModelAsync(TemplatedMessage msg, String text)
		{
			if (text.IndexOf("{{") == -1)
				return text;
			var dm = await msg.GetDataModelAsync(_dbContext, _msgParams);
			return dm.Root.Resolve(text);
		}

		public String ResolveEnvironment(String text)
		{
			if (text.IndexOf("((") == -1)
				return text;
			var r = new Regex("\\(\\((.+?)\\)\\)");
			var ms = r.Matches(text);
			if (ms.Count == 0)
				return text;
			var sb = new StringBuilder(text);
			var env = _msgModel.Eval<List<ExpandoObject>>("Message.Environment")
				.ToDictionary(k => k.Get<String>("Name"), v => v.Get<String>("Value"));
			foreach (Match m in ms)
			{
				String key = m.Groups[1].Value;
				if (env.TryGetValue(key, out String val))
					sb.Replace(m.Value, val);
				else
				{
					if (key == "Host")
						throw new MessagingException("Configuration parameter 'appSettings/appHost' not defined");
					throw new MessagingException($"Invalid environment key. '{key}'");
				}
			}
			return sb.ToString();
		}

		public String ResolveParameters(String text)
		{
			if (text.IndexOf("[[") == -1)
				return text;
			var r = new Regex("\\[\\[(.+?)\\]\\]");
			var ms = r.Matches(text);
			if (ms.Count == 0)
				return text;
			var sb = new StringBuilder(text);
			var env = _msgModel.Eval<List<ExpandoObject>>("Message.Parameters")
				.ToDictionary(k => k.Get<String>("Name"), v => v.Get<String>("Value")); ;
			foreach (Match m in ms)
			{
				String key = m.Groups[1].Value;
				if (env.TryGetValue(key, out String val))
					sb.Replace(m.Value, val);
				else
					throw new MessagingException($"Invalid parameter key. '{key}'");
			}
			return sb.ToString();
		}

		public Task<String> ResolveFileAsync(TemplatedMessage msg, String fileName)
		{
			if (String.IsNullOrEmpty(fileName))
				return null;
			String path = _host.MakeFullPath(false, fileName, String.Empty);
			if (!File.Exists(path))
				throw new MessagingException($"File not found {path}");
			String text = File.ReadAllText(path);
			return ResolveAsync(msg, text);
		}
	}
}
