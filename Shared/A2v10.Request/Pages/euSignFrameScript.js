// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

"use strict";

// global scope!
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

	}
	else {
		alert("Криптографічну бібліотеку не ініціалізовано");
	}
}

function EUSignCPModuleLoaded() {
	console.info('EUSign library loaded');
}

const euSign = EUSignCP();
const euSignUtils = Utils(euSign);


(function () {
	const popup = require('std:popup');
	const eventBus = require('std:eventBus');
	popup.startService();
	eventBus.$on('closeAllPopups', popup.closeAll);
})();