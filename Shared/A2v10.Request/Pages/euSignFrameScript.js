// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

"use strict";

// global scope!

const eventBus = require('std:eventBus');

function EUSignCPModuleInitialized(isInitialized) {
	console.info('EUSign library initialized');
	var URL_XML_HTTP_PROXY_SERVICE = "/Handlers/ProxyHandler.ashx";

	if (isInitialized) {
		euSign.Initialize();
		euSign.SetJavaStringCompliant(true);
		euSign.SetCharset("UTF-16LE");
		euSign.SetXMLHTTPProxyService(URL_XML_HTTP_PROXY_SERVICE);

		var settings = euSign.CreateFileStoreSettings();
		settings.SetPath("/certificates");
		settings.SetSaveLoadedCerts(true);
		euSign.SetFileStoreSettings(settings);

		settings = euSign.CreateProxySettings();
		euSign.SetProxySettings(settings);

		settings = euSign.CreateTSPSettings();
		euSign.SetTSPSettings(settings);

		settings = euSign.CreateOCSPSettings();
		euSign.SetOCSPSettings(settings);

		settings = euSign.CreateCMPSettings();
		euSign.SetCMPSettings(settings);

		settings = euSign.CreateLDAPSettings();
		euSign.SetLDAPSettings(settings);

		settings = euSign.CreateOCSPAccessInfoModeSettings();
		settings.SetEnabled(true);
		euSign.SetOCSPAccessInfoModeSettings(settings);

		getCerts();

	}
	else {
		alert("Криптографічну бібліотеку не ініціалізовано");
	}
}

function EUSignCPModuleLoaded() {
	console.info('EUSign library loaded');
	eventBus.$emit('eusign.loaded');
}

const euSign = EUSignCP();
const euSignUtils = Utils(euSign);

function getCerts()
{
	const CERTS_URL = '/scripts/eusign/CACertificates.p7b';
	const SESSION_STORAGE_NAME = 'CACertificates';

	function _onSuccess(certs) {
		if (euSignUtils.IsSessionStorageSupported()) {
			euSignUtils.SetSessionStorageItem(SESSION_STORAGE_NAME, certs);
		}
		euSign.SaveCertificates(certs);
	}

	function _onFail(error) {
		console.error(error);
	}

	if (euSignUtils.IsSessionStorageSupported()) {
		let certs = euSignUtils.GetSessionStorageItem(SESSION_STORAGE_NAME, true, false);
		if (certs) {
			euSign.SaveCertificates(certs);
			return;
		}
	}

	euSignUtils.GetDataFromServerAsync(CERTS_URL, _onSuccess, _onFail, true);
}