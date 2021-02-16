// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Diagnostics;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using Newtonsoft.Json;

namespace A2v10.Runtime
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

	public class DummyRequest : IProfileRequest
	{
		public IDisposable Start(ProfileAction kind, String description)
		{
			return null;
		}
		public void Stop()
		{

		}
	}

	public class DesktopProfiler : IProfiler, IDataProfiler
	{

		private ProfileRequest _request;
		private const Int32 _requestCount = 50;
		private readonly LinkedList<ProfileRequest> sessionArray = new LinkedList<ProfileRequest>();

		public Boolean Enabled { get; set; }

		public IProfileRequest BeginRequest(String address, String session)
		{
			if (!Enabled)
				return null;
			if (address.ToLowerInvariant().EndsWith("_shell/trace"))
				return null;
			_request = new ProfileRequest(address);
			sessionArray.AddFirst(_request);
			while (sessionArray.Count > _requestCount)
				sessionArray.RemoveLast();
			return _request;
		}

		public IProfileRequest CurrentRequest => _request ?? new DummyRequest() as IProfileRequest;

		public String GetJson()
		{
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
