// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

using System;
using A2v10.Infrastructure;

namespace A2v10.Web.Mvc.Configuration
{
    internal class ProfileItem : IDisposable
    {
        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }

    public class WebProfiler : IProfiler
	{
		public IDisposable Start(ProfileAction kind, String description)
		{
			// TODO:
			return null;
		}
	}
}
