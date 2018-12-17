// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.


using System;
using A2v10.Data.Interfaces;
using A2v10.Infrastructure;

namespace A2v10.Tests.Config
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

	public sealed class TestProfiler : IProfiler, IDataProfiler
	{
		public Boolean Enabled { get; set; }

		readonly IProfileRequest _request = new DummyRequest();

		public IProfileRequest BeginRequest(String address, String session)
		{
			return _request;
		}

		public IProfileRequest CurrentRequest => _request;

		public String GetJson()
		{
			return null;
		}

		IDisposable IDataProfiler.Start(String command)
		{
			return null;
		}
	}
}
