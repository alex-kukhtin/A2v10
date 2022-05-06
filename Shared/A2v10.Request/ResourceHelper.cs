// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

using System;
using System.Threading;
using A2v10.Request.Properties;

namespace A2v10.Request
{
	public static class ResourceHelper
	{
		public static String InitLayoutHtml => Resources.initLayout;
		public static String InitLayoutMobileHtml => Resources.initLayoutMobile;
		public static String LoginHtml => Resources.login;
		public static String LoginMobileHtml => Resources.loginMobile;
		public static String LoginScript => Resources.loginScript;
		public static String RegisterTenantHtml => Resources.registerTenant;
		public static String RegisterTenantScript => Resources.registerTenantScript;
		public static String ForgotPasswordHtml => Resources.forgotPassword;
		public static String ForgotPasswordMobileHtml => Resources.forgotPasswordMobile;
		public static String ForgotPasswordScript => Resources.forgotPasswordScript;
		public static String AppLinksScript => Resources.appLinkScript;

		public static String SimpleScript => Resources.simpleScript;
		public static String ErrorHtml => Resources.error;
		public static String ConfirmEMailHtml => Resources.confirmEMail;

		public static String ConfirmCodeHtml => Resources.confirmCode;
		public static String ConfirmCodeScript => Resources.confirmCodeScript;

		public static String StiReportHtml => Resources.stiReport;

		public static String PageUtils => Resources.pageUtils;
		public static String Mask => Resources.mask;


		public static String LocaleLibrary(String lang)
		{
			switch (lang.ToLowerInvariant())
			{
				case "uk": return Resources.locale_uk;
				case "en": return Resources.locale_en;
				case "ru": return Resources.locale_ru;
				case "de": return Resources.locale_de;
				case "pl": return Resources.locale_pl;
			}
			throw new InvalidOperationException("Only the following cultures are supported: 'uk', 'ru', 'en', 'de', 'pl'");
		}
	}
}
