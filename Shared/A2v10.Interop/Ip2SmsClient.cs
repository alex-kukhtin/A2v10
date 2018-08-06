
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Linq;

namespace A2v10.Interop
{
	class Ip2SmsConfig
	{
		public String requestUrl { get; set; }
		public String login { get; set; }
		public String password { get; set; }
		public String alpha { get; set; }
	}

	public class Ip2SmsResponse
	{
		public String Id { get; set; }
		public DateTime? Date { get; set; }
		public String State { get; set; }
		public String Error { get; set; }
	}

	public class Ip2SmsClient
	{
		private readonly ILogger _logger;
		private readonly IDbContext _dbContext;

		public Ip2SmsClient(ILogger logger, IDbContext dbContext)
		{
			_logger = logger;
			_dbContext = dbContext;
		}

		public async Task<Object> SendSmsAsync(String phoneNumber, String message, String extId)
		{

			var config = GetConfig();

			var wr = WebRequest.Create(config.requestUrl);
			wr.Method = "POST";
			wr.ContentType = "text/xml";

			String encoded = System.Convert.ToBase64String(System.Text.Encoding.GetEncoding("UTF-8").GetBytes(config.login + ":" + config.password));
			wr.Headers.Add("Authorization", "Basic " + encoded);
			// TODO: extId
			String xmlRequest = CreateXml(phoneNumber, message, extId, config.alpha);
			var bytes = Encoding.GetEncoding("UTF-8").GetBytes(xmlRequest);
			wr.ContentLength = bytes.Length;

			using (var rqs = await wr.GetRequestStreamAsync())
			{
				await rqs.WriteAsync(bytes, 0, bytes.Length);
			}
			using (var rsp = await wr.GetResponseAsync())
			{
				using (var rss = rsp.GetResponseStream())
				{
					using (var ms = new StreamReader(rss))
					{
						String xmlResponse = await ms.ReadToEndAsync();
						var result = ParseResult(xmlResponse);
						return result;
					}
				}
			}
		}

		Ip2SmsConfig GetConfig()
		{
			var str = ConfigurationManager.AppSettings["ip2smsApi"];
			if (str == null)
				throw new ConfigurationErrorsException("appSettings. ip2smsApi not found");
			return JsonConvert.DeserializeObject<Ip2SmsConfig>(str.Replace('\'', '"'));
		}

		String CreateXml(String phoneNumber, String message, String extId, String alphaName)
		{
			var xml = new XDocument(
				new XElement("message",
					new XElement("service", new XAttribute("id", "service"), new XAttribute("source", alphaName)),
					new XElement("to", new XAttribute("ext-id", extId), phoneNumber),
					new XElement("body", new XAttribute("content-type", "text/plain"),  message)
				)
			);
			return xml.ToString();
			/*
			using (var sw = new StringWriter())
			{
				xml.Save(sw);
				return sw.ToString();
			}
			*/
		}

		Ip2SmsResponse ParseResult(String result)
		{
			var resp = new Ip2SmsResponse();
			var xdoc = XDocument.Parse(result);
			var status = xdoc.Root;
			resp.Id = status.Attribute("id")?.Value;
			var date = status.Attribute("date")?.Value;
			if (DateTime.TryParse(date, out DateTime dt))
				resp.Date = dt;
			resp.State = status.Element("state")?.Value;
			resp.Error = status.Attribute("error")?.Value;
			return resp;
		}
	}
}
