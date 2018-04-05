// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

using System;
using System.Threading;
using A2v10.Request.Properties;

namespace A2v10.Request
{
	public static class ResourceHelper
	{
		public static String InitLayoutHtml => Resources.initLayout;
		public static String LoginHtml => Resources.login;
		public static String LoginScript => Resources.loginScript;
		public static String RegisterTenantHtml => Resources.registerTenant;
		public static String RegisterTenantScript => Resources.registerTenantScript;
		public static String ForgotPasswordHtml => Resources.forgotPassword;
		public static String ForgotPasswordScript => Resources.forgotPasswordScript;
		public static String ResetPasswordHtml => Resources.resetPassword;
		public static String ResetPasswordScript => Resources.resetPasswordScript;

		public static String SimpleScript => Resources.simpleScript;
		public static String ErrorHtml => Resources.error;
		public static String ConfirmEMailHtml => Resources.confirmEMail;

		public static String pageUtils => Resources.pageUtils;

		public static String StiReportHtml => Resources.stiReport;

		public static String locale
		{
			get
			{
				var culture = Thread.CurrentThread.CurrentUICulture;
				var lang = culture.TwoLetterISOLanguageName;
				switch (lang)
				{
					case "uk": return Resources.locale_uk;
					case "en": return Resources.locale_en;
					case "ru": return Resources.locale_ru;
				}
				throw new InvalidProgramException("Only the following cultures are supported: 'uk', 'ru', 'en'");
			}
		}
	}
}
