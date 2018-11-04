// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181104-7343*/
/* services/eusign.js */

app.modules['std:eusign'] = function () {
	const http = require('std:http');
	const urltools = require('std:url');

	return {
		readKey,
		signFile
	};

	function onError(err) {
		alert(err);
	}

	function readKey(pwd, file) {
		return new Promise(function (resolve, reject) {
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
					euSign.SaveCertificates(certs);
					euSign.ReadPrivateKeyBinary(key, password);
					const ownerInfo = euSign.GetPrivateKeyOwnerInfo();
					console.dir(ownerInfo);
					//root.Document.Signer = ownerInfo.GetSubjCN();
					//alert("Власник: " + ownerInfo.GetSubjCN());
					let rw = {
						subjCN: ownerInfo.GetSubjCN(),
						serial: ownerInfo.GetSerial(),
						issuerCN: ownerInfo.GetIssuerCN()
					};
					resolve(rw);
				});
			}

			euSign.ReadFile(file, function (file) {
				readPrivateKey(file.file.name, new Uint8Array(file.data), pwd);
			}, onError);
		});
	}

	function signFile() {
		return new Promise(function (resolve, reject) {

		});
	}
};