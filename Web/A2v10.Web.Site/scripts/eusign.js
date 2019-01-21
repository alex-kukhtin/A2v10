// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181105-7344*/
/* services/eusign.js */

app.modules['std:eusign'] = function () {

	const http = require('std:http');
	const urltools = require('std:url');
	const platform = require('std:platform');
	const eventBus = require('std:eventBus');
	const utils = require('std:utils');

	let prevSignFile = null;

	const EUSIGN_URL = 'eusign';
	return {
		loadAttachment,
		loadSignature,
		readKey,
		signData,
		verifyData,
		saveSignature,
		createContainer,
		getMessage,
		beginRequest() { eventBus.$emit('beginRequest', EUSIGN_URL); },
		endRequest() { eventBus.$emit('endRequest', EUSIGN_URL); }
	};


	function uploadData(data, filename) {
		let objUrl = URL.createObjectURL(new Blob([data]));
		let link = document.createElement('a');
		link.href = objUrl;
		document.body.appendChild(link); // FF!
		link.download = filename;
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(objUrl);
	}

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

	function getOwnCertificateInfo(keyType, keyUsage) {
		try {
			for (let index = 0; ;index++) {
				let info = euSign.EnumOwnCertificates(index);
				if (!info) return null;
				if (info.GetPublicKeyType() === keyType &&
					(info.GetKeyUsageType() & keyUsage) === keyUsage) {
					return info;
				}
			}
		} catch (e) {
			alert(e);
		}
		return null;
	}

	function getOwnCertificate(keyType, keyUsage) {
		try {
			let info = getOwnCertificateInfo(
				keyType, keyUsage);
			if (!info) return null;
			return euSign.GetCertificate(
				info.GetIssuer(), info.GetSerial());
		} catch (e) {
			alert(e);
		}
		return null;
	}


	function readKey(pwd, file) {

		eventBus.$emit('beginRequest', EUSIGN_URL);

		return new Promise(function (resolve, reject) {

			let addr = ['ca.ksystems.com.ua', 'masterkey.ua', 'acskidd.gov.ua', 'acsk.privatbank.ua'];

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
					euSign.ResetPrivateKey();
					let container = new Uint8Array(file.data);
					if (file.file.name.indexOf('.jks') !== -1) {
						let alias = euSign.EnumJKSPrivateKeys(container, 0);
						if (alias) {
							let jksKey = euSign.GetJKSPrivateKey(container, alias);

							for (let i = 0; i < jksKey.GetCertificatesCount(); i++) {
								euSign.SaveCertificate(jksKey.GetCertificate(i));
							}
							euSign.ReadPrivateKeyBinary(jksKey.GetPrivateKey(), pwd);
							const ownerInfo = euSign.GetPrivateKeyOwnerInfo();
							console.dir(ownerInfo);
							let rw = customOwnerInfo(ownerInfo);
							eventBus.$emit('endRequest', EUSIGN_URL);
							resolve(rw);
						}
					} else {
						readPrivateKey(file.file.name, container, pwd);
					}
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

	function signData(data, info) {
		let hash = euSign.HashData(data);
		let signer = euSign.CreateSigner(hash);

		if (prevSignFile) {
			let cont = euSign.AppendSigner(signer, null, prevSignFile);
			uploadData(cont, "full_6_signature");
			prevSignFile = cont;
			return null;
		} else {
			let cont = euSign.CreateEmptySign(data);
			prevSignFile = euSign.AppendSigner(signer, null, cont);
			return null;
		}

		//let result = euSign.SignDataInternal(false, data, false);
		//result = euSign.SignDataInternal(false, result, false);
		//uploadData(result, "full_2 signature");
		//uploadData(result, 'signature_p.p7s');
		/*
		let cont = euSign.CreateEmptySign(data);
		let hash = euSign.HashData(data);
		//let cert = getOwnCertificate(EU_CERT_KEY_TYPE_DSTU4145, EU_KEY_USAGE_DIGITAL_SIGNATURE);
		let signer = euSign.CreateSigner(hash);
		//let signer2 = euSign.CreateSigner(hash);

		let signer4 = euSign.AppendSigner(signer, null, cont);

		cont = euSign.CreateEmptySign(signer4);
		let result = euSign.AppendSigner(signer2, null, cont);

		uploadData(result, 'full_file_4');

		return result;
		//return euSign.SignData(data, false);
		*/

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


	function createContainer(data, signs) {
		let cont = euSign.CreateEmptySign(data);
		let hash = euSign.HashData(data);
		let cert = getOwnCertificate(EU_CERT_KEY_TYPE_DSTU4145, EU_KEY_USAGE_DIGITAL_SIGNATURE);
		let xdata = null;

		for (let i = 0; i < signs.length; i++) {
			let signer = euSign.CreateSigner(hash);
			xdata = euSign.AppendSigner(signer, cert, cont);
			xdata = euSign.AppendValidationDataToSigner(xdata, cert);
		}
		console.dir(cont);


		return cont;
	}
};