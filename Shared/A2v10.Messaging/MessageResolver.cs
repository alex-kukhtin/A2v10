// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Reports;
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
		private readonly ReportHelper _reportHelper;


		public MessageResolver(IApplicationHost host, IDbContext dbContext, IDataModel msgModel)
		{
			_host = host;
			_dbContext = dbContext;
			_msgModel = msgModel;
			_reportHelper = new ReportHelper(_host);
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
			if (text.StartsWith("`"))
				text = text.Substring(1);
			var sb = new StringBuilder(text);
			text = await ResolveDataModelAsync(msg, text);
			text = ResolveEnvironment(text);
			text = ResolveParameters(text);
			return text;
		}

		public async Task<Stream> ResolveStreamAsync(TemplatedMessage msg, String text)
		{
			if (text == null)
				return null;
			if (text.StartsWith("`"))
				text = text.Substring(1);
			if (text.IndexOf("{{") == -1)
				return null;
			var dm = await msg.GetDataModelAsync(_dbContext, _msgParams);
			var bytes = dm.Root.Eval<Byte[]>(text.Substring(2, text.Length - 4));
			if (bytes == null || bytes.Length == 0)
				return null;
			return new MemoryStream(bytes);
		}

		public async Task<Stream> ResolveStreamStringAsync(TemplatedMessage msg, String text)
		{
			if (text == null)
				return null;
			if (text.StartsWith("`"))
				text = text.Substring(1);
			if (text.IndexOf("{{") == -1)
				return null;
			var dm = await msg.GetDataModelAsync(_dbContext, _msgParams);
			var data = dm.Root.Eval<String>(text.Substring(2, text.Length - 4));
			if (String.IsNullOrEmpty(data))
				return null;
			return new MemoryStream(Encoding.UTF8.GetBytes(data));
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
					else if (key == "UserHost")
						throw new MessagingException("Configuration parameter 'appSettings/userAppHost' not defined");
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
			String fileText = _host.ApplicationReader.ReadTextFile(fileName, String.Empty);
			if (fileText == null)
				throw new MessagingException($"File not found '{fileName}'");
			return ResolveAsync(msg, fileText);
		}

		public async Task<Stream> ResolveReportAsync(TemplatedMessage msg, MessageReport rep)
		{
			if (rep == null)
				return null;
			_reportHelper.SetupLicense();
			var dm = await msg.GetDataModelAsync(_dbContext, _msgParams);
			// get report source
			using (Stream input = await ResolveStreamStringAsync(msg, rep.Report))
			{
				if (input == null)
					throw new MessagingException($"ReportStream not found ({rep.Report}).");
				// get report datamodel
				IDataModel repDataModel = null;
				if (rep.Model != null)
				{
					var repPrms = new ExpandoObject();
					if (rep.Model.Parameters != null)
						foreach (var p in rep.Model.Parameters)
							repPrms.Set(p.Key, await ResolveAsync(msg, p.Value?.Value));
					repDataModel = await _dbContext.LoadModelAsync(rep.Model.Source, $"[{rep.Model.Schema}].[{rep.Model.Model}.Report]", repPrms);
				}
				var ms = new MemoryStream();
				var repName = await _reportHelper.ExportDocumentAsync(input, repDataModel, ms);
				ms.Seek(0, SeekOrigin.Begin);
				return ms;
			}
		}
	}
}
