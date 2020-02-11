// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

/*20200211-7630*/
/* services/eusign.js */

app.modules['std:eusign'] = function () {

	const http = require('std:http');
	const urltools = require('std:url');
	const eventBus = require('std:eventBus');
	const utils = require('std:utils');

	const enableLog = true;

	const EUSIGN_URL = 'eusign';

	return {
		loadAttachment,
		loadSignature,
		loadSignedData,
		readKey,
		signData,
		verifyData,
		saveSignature,
		getMessage,
		findKeys,
		beginRequest() { eventBus.$emit('beginRequest', EUSIGN_URL); },
		endRequest() { eventBus.$emit('endRequest', EUSIGN_URL); }
	};

	function log(obj) {
		if (!enableLog)
			return;
		console.dir(obj);
	}


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
			subject: ownerInfo.GetSubject(),
			EDRPOUCode: ownerInfo.GetSubjEDRPOUCode(),
			DRFOCode: ownerInfo.GetSubjDRFOCode(),
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


	function findKeys(file) {
		return new Promise(function (resolve, reject) {
			euSign.ReadFile(file, function (file) {
				let container = new Uint8Array(file.data);
				let arr = [];
				for (let i = 0; i < 100; i++) {
					try {
						let alias = euSign.EnumJKSPrivateKeys(container, i);
						if (!alias)
							break;
						arr.push(alias);
					} catch (e) {
						break;
					}
				}
				resolve(arr);
			}, function (err) {
				reject(err);
			});
		});
	}

	function readKey(pwd, file, alias) {

		eventBus.$emit('beginRequest', EUSIGN_URL);

		return new Promise(function (resolve, reject) {

			let addr = ['acskidd.gov.ua', 'ca.informjust.ua', 'acsk.privatbank.ua', 'ca.ksystems.com.ua', 'masterkey.ua', 'uakey.com.ua'];

			function getPrivateKeyCertificatesByCMP(key, onSuccess) {
				var keyInfo = euSign.GetKeyInfoBinary(key, pwd);
				log(keyInfo);
				var certs = euSign.GetCertificatesByKeyInfo(keyInfo, addr);
				log(certs);
				onSuccess(certs);
			}

			function readPrivateKey(name, key, password) {
				getPrivateKeyCertificatesByCMP(key, function (certs) {
					euSign.SaveCertificates(certs);
					euSign.ReadPrivateKeyBinary(key, password);
					const ownerInfo = euSign.GetPrivateKeyOwnerInfo();
					log(ownerInfo);
					let rw = customOwnerInfo(ownerInfo);
					eventBus.$emit('endRequest', EUSIGN_URL);
					resolve(rw);
				});
			}

			setTimeout(() => {
				//euSign.ReadFile
				internalReadFile(file, function (file) {
					euSign.ResetPrivateKey();
					let container = new Uint8Array(file.data);
					if (alias) {
						let jksKey = euSign.GetJKSPrivateKey(container, alias);
						for (let i = 0; i < jksKey.GetCertificatesCount(); i++) {
							euSign.SaveCertificate(jksKey.GetCertificate(i));
						}
						euSign.ReadPrivateKeyBinary(jksKey.GetPrivateKey(), pwd);
						const ownerInfo = euSign.GetPrivateKeyOwnerInfo();
						log(ownerInfo);
						let rw = customOwnerInfo(ownerInfo);
						eventBus.$emit('endRequest', EUSIGN_URL);
						resolve(rw);
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
		let raw = loadRaw(url, id, 'raw');
		let prev = loadRaw(url, id, 'prev');
		return Promise.all([raw, prev]);
	}

	function loadSignedData(url, id) {
		return loadRaw(url, id, 'prev');
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

	function signData(blobs) {
		let cert = getOwnCertificate(EU_CERT_KEY_TYPE_DSTU4145, EU_KEY_USAGE_DIGITAL_SIGNATURE);
		let data = blobs[0];
		let cont = blobs[1];
		let hash = euSign.HashData(data);
		let signer = euSign.CreateSigner(hash);
		if (!cont.length)
			cont = euSign.CreateEmptySign(data);
		let result = euSign.AppendSigner(signer, cert, cont);
		let info = euSign.VerifyDataInternal(result);
		return { data: result, ownerInfo: euSign.GetPrivateKeyOwnerInfo() };
	}

	function verifyData(data) {
		let verify = euSign.VerifyDataInternal(data);
		return verify;
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
				let ownerInfo = prms.ownerInfo;
				formData.append("subjCN", ownerInfo.GetSubjCN());
				formData.append("issuer", ownerInfo.GetIssuerCN());
				formData.append("serial", ownerInfo.GetSerial());
				formData.append("title", ownerInfo.GetSubjTitle());
			}
			http.upload(postUrl, formData, true).then(function (result) {
				log(result);
				resolve(result);
			}).catch(function(error) {
				reject(error);
			});
		});
	}


	function internalReadFile(file, onSuccess, onError) {
		let fr = new FileReader();
		fr.onloadend = function (evt) {
			if (evt.target.readyState !== FileReader.DONE)
				return;
			try {
				let loadedFile = new EndUserFile();

				loadedFile.SetTransferableObject({
					'file': file,
					'data': new Uint8Array(evt.target.result)
				});
				onSuccess(loadedFile);
			}
			catch (e) {
				onError(e);
			}
		};
		fr.onerror = function (e) {
			onError(e);
		};
		fr.readAsArrayBuffer(file);
	}
};