// Copyright © 2019-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.IO;
using System.Net;
using System.Text;

using Newtonsoft.Json;

using A2v10.Infrastructure;
using A2v10.Data.Interfaces;

namespace A2v10.Javascript;

public class KsSmsConfig
{
	public String Url;
	public String Login;
	public String Password;
	public String Source;

	public String AuthString =>
		Convert.ToBase64String(Encoding.UTF8.GetBytes($"{Login}:{Password}"));
}

public class KsSmsSender
{
    private readonly IServiceLocator _locator;
    private readonly ExpandoObject _params;
	private readonly IDbContext _dbContext;

	public readonly KsSmsConfig _config;
	public KsSmsSender(IServiceLocator locator, ExpandoObject prms)
	{
		_locator = locator;
		_dbContext = locator.GetService<IDbContext>();	
		_params = prms;
		_config = new KsSmsConfig()
		{
			Url = prms.Get<String>("url"),
			Login = prms.Get<String>("login"),
			Password = prms.Get<String>("password"),
			Source = prms.Get<String>("source")
		};
		CheckParams();
	}

	void CheckParams()
	{
		// todo:
	}

	public KsResponse sendSms(String phone, String text)
	{
		var msg = KsMessage.SmsMessage("CC Support", phone, text);
		return SendMessage(msg);
	}
	public KsResponse sendViber(String phone, String text)
	{
		var msg = KsMessage.ViberMessage(phone, text);
		return SendMessage(msg);
	}

	private KsResponse SendMessage(KsMessage msg)
	{ 
		var wr = WebRequest.Create(_config.Url);
		wr.Method = "POST";
		wr.ContentType = "application/json";

		wr.Headers.Add("Authorization", "Basic " + _config.AuthString);

		var msgstring = JsonConvert.SerializeObject(msg, new JsonSerializerSettings()
		{
			NullValueHandling = NullValueHandling.Ignore
		});

		var bytes = Encoding.UTF8.GetBytes(msgstring);
		wr.ContentLength = bytes.Length;

		try
		{
			using (var rqs = wr.GetRequestStream())
			{
				rqs.Write(bytes, 0, bytes.Length);
			}
			using (var rsp = wr.GetResponse())
			{
				using (var rss = rsp.GetResponseStream())
				{
					using (var ms = new StreamReader(rss))
					{
						String resp = ms.ReadToEnd();
						var mr = JsonConvert.DeserializeObject<KsResponse>(resp);
						mr.success = true;
						return mr;
					}
				}
			}
		}
		catch (WebException wex)
		{
			if (wex.Response != null && wex.Response is HttpWebResponse webResp)
			{
				using (var rs = new StreamReader(wex.Response.GetResponseStream()))
				{
					String strError = rs.ReadToEnd();
					var mr = JsonConvert.DeserializeObject<KsResponse>(strError);
					mr.success = false;
					return mr;
				}
			}
			return new KsResponse()
			{
				success = false,
				errorMsg = wex.Message
			};
		}
	}
}

