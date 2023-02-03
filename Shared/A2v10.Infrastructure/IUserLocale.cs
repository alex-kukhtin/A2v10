// Copyright © 2021-2023 Oleksandr Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure;

public interface IUserLocale
{
	String Locale { get; set; }
	String Language { get; }
	String Language2 { get; }
}
