// Copyright © 2012-2017 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Data
{
	public class DataLoaderException : Exception
	{
		public DataLoaderException(String message)
			:base(message)
		{
		}
	}

	public class DataWriterException : Exception
	{
		public DataWriterException(String message)
			:base(message)
		{
		}
	}

    public class DataDynamicException: Exception
    {
        public DataDynamicException(String message)
			:base(message)
		{
        }
    }
}
