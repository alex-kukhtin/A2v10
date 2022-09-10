// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

using System;
using System.Dynamic;
using System.Threading.Tasks;

namespace A2v10.Infrastructure;


public class HttpInvokeResult
{
	public String ContentType { get; set; }
	public Byte[] BinaryData { get; set; }
	public String StringData { get; set; }
}

public interface ICommandInvoker
{
	Task<HttpInvokeResult> Invoke(String command, String baseUrl, ExpandoObject parameters);
}
