// Copyright © 2015-2022 Oleksandr Kukhtin. All rights reserved.

using A2v10.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A2v10.Web.Mvc
{
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
}
