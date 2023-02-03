// Copyright © 2015-2023 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure;

public record LicenseInfo
{
	public Boolean Ok;
	public String Name;
	public DateTime Expired;
	public String[] Modules;
	public String Error;
}

public interface ILicenseManager
{
	LicenseInfo VerifyLicense(String license);
}
