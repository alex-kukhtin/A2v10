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

var euSign = EUSignCP();
var euSignUtils = Utils(euSign);

function onError(err) {
	alert(err);
}

(function () {
	const http = require('std:http');
	const urltools = require('std:url');

	const currentElem = {
		id: $(Id),
		base: '$(Base)'
	};

	const vm = new Vue({
		el: "#frame",
		data: {
			frameSrc: '/attachment/show/$(Id)?base=$(Base)',
			password: '',
			keyOwner: '',
			file: null
		},
		computed: {
			readKeyDisabled() {
				return !(this.file && this.password);
			},
			noKey() {
				return !this.keyOwner;
			}
		},
		methods: {
			handleFile(e) {
				this.file = e.target.files[0]; 
			},
			readKey() {
				let that = this;

				let pwd = this.password;
				let addr = ['ca.ksystems.com.ua', 'masterkey.ua', 'acskidd.gov.ua'];

				function getPrivateKeyCertificatesByCMP(key, onSuccess) {
					var keyInfo = euSign.GetKeyInfoBinary(key, pwd);
					console.dir(keyInfo);
					var certs = euSign.GetCertificatesByKeyInfo(keyInfo, addr);
					console.dir(certs);
					onSuccess(certs);
				}

				function readPrivateKey(name, key, password) {
					getPrivateKeyCertificatesByCMP(key, function (certs) {
						//var dm = window.$dataModel;
						euSign.SaveCertificates(certs);
						euSign.ReadPrivateKeyBinary(key, password);
						var ownerInfo = euSign.GetPrivateKeyOwnerInfo();
						console.dir(ownerInfo);
						//root.Document.Signer = ownerInfo.GetSubjCN();
						alert("Власник: " + ownerInfo.GetSubjCN());
						//dm.keyOwner = ownerInfo.GetSubjCN();
						that.keyOwner = ownerInfo.GetSubjCN();
					});
				}

				euSign.ReadFile(this.file, function (file) {
					readPrivateKey(file.file.name, new Uint8Array(file.data), pwd);
				}, onError);
			},
			signFile() {
				alert('sign file here');
				const that = this;
				let url = '/eusign/loadraw/' + currentElem.id + '?base=' + currentElem.base;
				http.post(url, null, true).then(function (result) {
					let fr = new FileReader();
					fr.onloadend = function (evt) {
						if (evt.target.readyState !== FileReader.DONE)
							return;
						let data = new Uint8Array(evt.target.result);
						try {
							let sign = euSign.SignData(data, false);
							console.dir(sign);
							let verify = euSign.VerifyData(data, sign);
							console.dir(verify);
							that.saveSignature(sign);
						} catch (err) {
							alert(err);
						}
					};
					fr.readAsArrayBuffer(result);
				});
			},
			saveSignature(sign) {
				const that = this;
				let formData = new FormData();
				let url = '/eusign/savesignature/' + currentElem.id + '?base=' + currentElem.base;
				formData.append("file", new Blob([sign]), "blob");
				formData.append("signer", that.keyOwner);
				http.upload(url, formData, true).then(function (result) {
					console.dir(result);
					alert('success');
				});
			}
		},
		created() {
		},
		destroyed() {
		}
	});
})();
