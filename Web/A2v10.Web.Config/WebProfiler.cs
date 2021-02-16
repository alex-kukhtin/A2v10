// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Web.Config
{
	public class ProfileTimer
	{
		Stopwatch _timer;
		protected ProfileTimer()
		{
			_timer = new Stopwatch();
			_timer.Start();
		}
		public void Stop()
		{
			if (_timer.IsRunning)
				_timer.Stop();
		}

		[JsonProperty("elapsed")]
		public Int64 Elapsed => _timer.ElapsedMilliseconds;

	}

	public sealed class ProfileItem : ProfileTimer, IDisposable
	{
		readonly String _message;

		public ProfileItem(String msg)
			: base()
		{
			_message = msg;
		}

		[JsonProperty("text")]
		public String Text => _message;

		public void Dispose()
		{
			Stop();
		}
	}

	internal class ProfileItems : List<ProfileItem>
	{
	}

	internal class ProfileRequest : ProfileTimer, IProfileRequest, IDisposable
	{
		IDictionary<ProfileAction, ProfileItems> _items = new Dictionary<ProfileAction, ProfileItems>();
		readonly String _address;

		public ProfileRequest(String address)
			: base()
		{
			_address = address;
		}

		public void Dispose()
		{
			Stop();
		}

		[JsonProperty("url")]
		public String Url => _address;

		[JsonProperty("elapsed")]
		public Int64 JsonElapsed => Elapsed;

		[JsonProperty("items")]
		public IDictionary<ProfileAction, ProfileItems> Items => _items;

		public IDisposable Start(ProfileAction kind, String description)
		{
			var itm = new ProfileItem(description);
			if (!_items.TryGetValue(kind, out ProfileItems elems))
			{
				elems = new ProfileItems();
				_items.Add(kind, elems);
			}
			elems.Add(itm);
			return itm;
		}
	}

	internal class DummyRequest : IProfileRequest
	{
		public IDisposable Start(ProfileAction kind, String description)
		{
			return null;
		}

		public void Stop()
		{
		}
	}

	public sealed class WebProfiler : IProfiler, IDataProfiler, IDisposable
	{
		const String _sessionKey = "_Profile_";
		const Int32 _requestCount = 50;

		readonly LinkedList<ProfileRequest> _requestList = new LinkedList<ProfileRequest>();

		readonly IDictionary<ProfileAction, ProfileItems> _items = new Dictionary<ProfileAction, ProfileItems>();

		public Boolean Enabled { get; set; }

		ProfileRequest _request;

		public WebProfiler()
		{
		}

		public void Dispose()
		{
			if (_request != null)
				_request.Dispose();
		}

		public IProfileRequest CurrentRequest => _request ?? new DummyRequest() as IProfileRequest;

		public IProfileRequest BeginRequest(String address, String session)
		{
			if (!Enabled)
				return null;
			if (address.ToLowerInvariant().EndsWith("/_shell/trace"))
				return null;
			_request = new ProfileRequest(address);
			AddRequestToSession(_request);
			return _request;
		}

		void AddRequestToSession(ProfileRequest action)
		{
			var currentContext = HttpContext.Current;
			if (currentContext == null)
				return;
			if (!(currentContext.Session[_sessionKey] is LinkedList<ProfileRequest> sessionArray))
			{
				sessionArray = new LinkedList<ProfileRequest>();
				currentContext.Session.Add(_sessionKey, sessionArray);
			}
			sessionArray.AddFirst(action);
			while (sessionArray.Count > _requestCount)
				sessionArray.RemoveLast();
		}

		public String GetJson()
		{
			var currentContext = HttpContext.Current;
			if (currentContext == null)
				return null;
			if (!(currentContext.Session[_sessionKey] is LinkedList<ProfileRequest> sessionArray))
				return null;
			return JsonConvert.SerializeObject(sessionArray);
		}

		#region IDataProfiler
		IDisposable IDataProfiler.Start(String command)
		{
			return CurrentRequest.Start(ProfileAction.Sql, command);
		}
		#endregion
	}
}
