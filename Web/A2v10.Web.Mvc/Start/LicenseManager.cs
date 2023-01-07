// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;

using A2v10.Infrastructure;

namespace A2v10.Web.Mvc;

public class LicenseManager : ILicenseManager
{
	private LicenseManager()
	{
	}

	public static LicenseManager Create()
	{
		return new LicenseManager();
	}

	public LicenseState VerifyLicense(String companyCode)
	{
		throw new NotImplementedException();
	}
}
