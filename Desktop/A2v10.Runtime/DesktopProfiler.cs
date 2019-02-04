// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Runtime
{

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
		public Boolean Enabled { get; set; }

		IProfileRequest _request;

		public IProfileRequest BeginRequest(String address, String session)
		{
			_request = new DummyRequest();
			return _request;
		}

		public IProfileRequest CurrentRequest => _request ?? new DummyRequest() as IProfileRequest;


		public String GetJson()
		{
			return null;
		}

		#region IDataProfiler
		IDisposable IDataProfiler.Start(String command)
		{
			return CurrentRequest.Start(ProfileAction.Sql, command);
		}
		#endregion
	}
}
