using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Tests.Config
{
	public class DummyToken : IDisposable
	{
		public void Dispose()
		{
			// do nothing
		}
	}

	public class TestProfiler : IProfiler
	{
		public IDisposable Start(ProfileAction kind, String description) {
			return new DummyToken();
		}
	}
}
