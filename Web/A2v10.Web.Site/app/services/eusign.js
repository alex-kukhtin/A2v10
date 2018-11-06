// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181105-7344*/
/* services/eusign.js */

app.modules['std:eusign'] = function () {

	const http = require('std:http');
	const urltools = require('std:url');
	const platform = require('std:platform');
	const eventBus = require('std:eventBus');
	const utils = require('std:utils');

	const EUSIGN_URL = 'eusign';
	return {
		loadAttachment,
		loadSignature,
		readKey,
		signData,
		verifyData,
		saveSignature,
		getMessage,
		beginRequest() { eventBus.$emit('beginRequest', EUSIGN_URL); },
		endRequest() { eventBus.$emit('endRequest', EUSIGN_URL); }
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
					reject(error);
				});
			}, 20 /*???*/);
		});
	}


	function loadSignature(url, id) {
		return loadRaw(url, id, 'signature');
	}

	function loadAttachment(url, id) {
		return loadRaw(url, id, 'raw');
	}

	function loadRaw(url, id, controller) {
		return new Promise(async function (resolve, reject) {
			let postUrl = `/attachment/${controller}/${id}` + urltools.makeQueryString({ base: url });
			try {
				let result = await http.post(postUrl, null, true); // raw
				let fr = new FileReader();
				fr.onloadend = function (evt) {
					if (evt.target.readyState !== FileReader.DONE)
						return;
					let data = new Uint8Array(evt.target.result);
					try {
						resolve(data);
					} catch (err) {
						reject(err);
					}
				};
				fr.readAsArrayBuffer(result);
			} catch (err) {
				reject(err);
			}
		});
	}

	function signData(data) {
		return euSign.SignData(data, false);
	}

	function verifyData(data, sign) {
		let verify = euSign.VerifyData(data, sign);
		let ownerInfo = verify.GetOwnerInfo();
		let timeInfo = verify.GetTimeInfo();
		return customOwnerInfo(ownerInfo, timeInfo);
	}

	function getMessage(err) {
		let msg = err;
		if (err.GetMessage)
			msg = err.GetMessage();
		if (utils.isDefined(err.message))
			msg = err.message;
		return msg;
	}

	function saveSignature(prms) {
		return new Promise(function (resolve, reject) {
			let formData = new FormData();
			let postUrl = `/attachment/sign/${prms.id}` + urltools.makeQueryString({ base: prms.base });
			formData.append("file", new Blob([prms.signature]), "blob");
			formData.append("kind", prms.kind || '');
			if (prms.ownerInfo) {
				formData.append("subjCN", prms.ownerInfo.subjCN);
				formData.append("issuer", prms.ownerInfo.issuerCN);
				formData.append("serial", prms.ownerInfo.serial);
				formData.append("time", prms.ownerInfo.time.getTime());
			}
			http.upload(postUrl, formData, true).then(function (result) {
				console.dir(result);
				resolve(result);
			}).catch(function(error) {
				reject(error);
			});
		});
	}

};
