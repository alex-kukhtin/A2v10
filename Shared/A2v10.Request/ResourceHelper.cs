// Copyright © 2015-2023 Oleksandr Kukhtin. All rights reserved.

using System;
using A2v10.Request.Properties;

namespace A2v10.Request;

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
	public static String InitPasswordHtml => Resources.initPassword;
	public static String InitPasswordScript => Resources.initPasswordScript;

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
		return lang.ToLowerInvariant() switch
		{
			"uk" => Resources.locale_uk,
			"en" => Resources.locale_en,
			"ru" => Resources.locale_ru,
			"de" => Resources.locale_de,
			"pl" => Resources.locale_pl,
			"es" => Resources.locale_es,
            "bg" => Resources.locale_bg,
            _ => throw new InvalidOperationException("Only the following cultures are supported: 'uk', 'ru', 'en', 'de', 'pl', 'es', 'bg'"),
		};
	}
}
