// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181105-7344*/
/* services/eusign.js */

app.modules['std:eusign'] = function () {
	const http = require('std:http');
	const urltools = require('std:url');
	const platform = require('std:platform');
	const eventBus = require('std:eventBus');

	const EUSIGN_URL = 'eusign';
	return {
		loadAttachment,
		readKey,
		signData: function (data) {
			try {
				return euSign.SignData(data, false);
			} catch (err) {
				alert(err);
				return null;
			}
		},
		verifyData
	};

	function customOwnerInfo(ownerInfo, timeInfo) {
		let rw = {
			subjCN: ownerInfo.GetSubjCN(),
			serial: ownerInfo.GetSerial(),
			issuerCN: ownerInfo.GetIssuerCN(),
			time: null
		};
		if (timeInfo && timeInfo.IsTimeAvail)
			rw.time = timeInfo.GetTime();

		return rw;
	}

	function readKey(pwd, file) {

		eventBus.$emit('beginRequest', EUSIGN_URL);

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
					let rw = customOwnerInfo(ownerInfo);
					eventBus.$emit('endRequest', EUSIGN_URL);
					resolve(rw);
				});
			}

			setTimeout(() => {
				euSign.ReadFile(file, function (file) {
					readPrivateKey(file.file.name, new Uint8Array(file.data), pwd);
				}, function (error) {
					eventBus.$emit('endRequest', EUSIGN_URL);
					alert(error);
				});
			}, 1 /*???*/);
		});
	}

	function loadAttachment(url, id) {
		return new Promise(async function (resolve, reject) {
			let postUrl = `/attachment/raw/${id}` + urltools.makeQueryString({base:url});
			let result = await http.post(postUrl, null, true); // raw

			let fr = new FileReader();
			fr.onloadend = function (evt) {
				if (evt.target.readyState !== FileReader.DONE)
					return;
				let data = new Uint8Array(evt.target.result);
				try {
					resolve(data);
				} catch (err) {
					alert(err);
				}
			};
			fr.readAsArrayBuffer(result);
		});
	}

	function signData(data) {
		try {
			return euSign.SignData(data, false);
		} catch (err) {
			alert(err);
			return null;
		}
	}

	function verifyData(data, sign) {
		try {
			let verify = euSign.VerifyData(data, sign);
			let ownerInfo = verify.GetOwnerInfo();
			let timeInfo = verify.GetTimeInfo();
			return customOwnerInfo(ownerInfo, timeInfo);
		} catch (err) {
			alert(err);
			return null;
		}
	}

};
