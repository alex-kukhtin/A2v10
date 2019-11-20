// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Security.Cryptography.Xml;
using System.Xml;

using A2v10.Data.Interfaces;
using A2v10.Infrastructure;
using A2v10.Runtime.Properties;

namespace A2v10.Runtime
{
	public class LicenseText
	{
		public String Text { get; set; }
	}

	public class DesktopLicenseManager : ILicenseManager
	{
		private readonly IDbContext _dbContext;

		private Boolean _loaded = false;
		private LicenseState _currentState;
		private Dictionary<String, String> _companies;
		private String _lastError;
		private DateTime _expired;

		public DesktopLicenseManager(IDbContext dbContext)
		{
			_dbContext = dbContext;
			_companies = new Dictionary<String, String>();
		}

		public LicenseState VerifyLicense(String companyCode)
		{
			LoadLicense();
			if (_currentState != LicenseState.Ok)
				return _currentState;
			if (!VerifyCompany(companyCode))
				return LicenseState.InvalidCompany;
			return LicenseState.Ok;
		}

		void LoadLicense()
		{
			if (_loaded)
				return;
			_loaded = true;
			try
			{
				var licText = _dbContext.Load<LicenseText>(null, "a2security.[License.Load]");
				if (String.IsNullOrEmpty(licText.Text))
				{
					_currentState = LicenseState.NotFound;
					return;
				}
				ParseLicense(licText.Text);
			}
			catch (Exception ex)
			{
				_lastError = ex.Message;
				_currentState = LicenseState.FileCorrupt;
			}
		}

		void ParseLicense(String text)
		{
			var xmlDoc = new XmlDocument()
			{
				PreserveWhitespace = true
			};
			xmlDoc.LoadXml(text);
			if (!VerifySignature(xmlDoc))
			{
				_currentState = LicenseState.InvalidSignature;
				return;
			}
			String dateExpired = xmlDoc.DocumentElement.GetAttribute("Expired");
			if (String.IsNullOrEmpty(dateExpired))
			{
				_currentState = LicenseState.FileCorrupt;
				return;
			}

			_expired = new DateTime(
				Int32.Parse(dateExpired.Substring(0, 4)),
				Int32.Parse(dateExpired.Substring(4, 2)),
				Int32.Parse(dateExpired.Substring(6, 2))
			);

			if (DateTime.Today > _expired)
			{
				_currentState = LicenseState.Expired;
				return;
			}
			foreach (var ch in xmlDoc.DocumentElement.ChildNodes)
				if (ch is XmlElement xch)
					switch (xch.Name)
					{
						case "Companies":
							foreach (var chch in xch.ChildNodes)
								if (chch is XmlElement xchch)
									switch (xchch.Name)
									{
										case "Company":
											var code = xchch.GetAttribute("Code");
											var name = xchch.GetAttribute("Name");
											_companies.Add(code, name);
											break;
									}
							break;
					}
		}

		Boolean VerifySignature(XmlDocument xmlDoc)
		{
			CspParameters csp = new CspParameters();
			var key = new RSACryptoServiceProvider(csp);
			var cspBlobPublic = Resources.publicKeys;
			key.ImportCspBlob(cspBlobPublic);

			var signedXml = new SignedXml(xmlDoc);
			var signatureList = xmlDoc.GetElementsByTagName("Signature");
			signedXml.LoadXml(signatureList[0] as XmlElement);

			return signedXml.CheckSignature(key);
		}

		Boolean VerifyCompany(String companyCode)
		{
			if (_companies.ContainsKey(companyCode))
				return true;
			return false;
		}
	}
}
