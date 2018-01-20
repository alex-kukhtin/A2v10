using System;

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

    public class DesktopProfiler : IProfiler
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
