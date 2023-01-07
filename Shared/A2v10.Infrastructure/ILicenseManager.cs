// Copyright © 2015-2023 Alex Kukhtin. All rights reserved.

using System;

namespace A2v10.Infrastructure;

public enum LicenseState
{
	Ok,
	NotFound,
	InvalidSignature,
	Expired,
	InvalidCompany,
	FileCorrupt,
	UnknownError
}

public interface ILicenseManager
{
	LicenseState VerifyLicense(String companyCode);
}
