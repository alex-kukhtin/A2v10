// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Data.Interfaces;

namespace A2v10.Infrastructure
{
	public class NullRequest : IProfileRequest
	{
		public IDisposable Start(ProfileAction kind, String description)
		{
			return null;
		}
		public void Stop()
		{

		}
	}

	public sealed class NullProfiler : IProfiler, IDataProfiler
	{
		readonly IProfileRequest _request = new NullRequest();
		
		#region IProfiler

		public Boolean Enabled { get; set; }

		public IProfileRequest CurrentRequest => _request;

		public IProfileRequest BeginRequest(String address, String session)
		{
			return _request;
		}

		public String GetJson()
		{
			return null;
		}

		#endregion

		#region IDataProfiler 

		IDisposable IDataProfiler.Start(String command)
		{
			return null;
		}
		
		#endregion
	}
}
