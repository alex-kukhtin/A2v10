// Copyright © 2012-2018 Alex Kukhtin. All rights reserved.


using System;
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

    public class TestProfiler : IProfiler
	{
        public Boolean Enabled { get; set; }
        IProfileRequest _request;
        public IProfileRequest BeginRequest(String address, String session)
        {
            _request = new DummyRequest();
            return _request;
        }

        public IProfileRequest CurrentRequest => _request;

        public String GetJson()
        {
            return null;
        }
    }
}
