// Copyright © 2019-2020 Alex Kukhtin. All rights reserved.

(function (runtime) {

	console.info('a2v10 browser companion. Background started');

	const DEBUG = true;
	const hostName = "com.a2v10.companion";

	function log(msg) {
		if (!DEBUG)
			return;
		console.dir(msg);
	}

	function loadSettings() {
		let settings = localStorage.getItem('pos.settings');
		if (!settings) {
			return null;
		}
		return JSON.parse(settings);
	}

	runtime.onConnectExternal.addListener(function (port, sender) {

		log('connect external (background.js)')

		let externalPort = port;
		let nativePort = null;

		try {
			nativePort = runtime.connectNative(hostName);
		}
		catch (err) {
			console.error(err);
		}

		nativePort.onMessage.addListener(function(msg, port) {
			// response message;
			log('nativePort.onMessage');
			externalPort.postMessage(msg);
		});

		port.onMessage.addListener(function (msg, port) {
			log('port.onMessage');
			log(msg);
			if (msg.command === 'options') {
				runtime.openOptionsPage();
				return;
			}
			else if (msg.command === 'connect') {
				let data = loadSettings();
				if (!data)
					externalPort.postMessage({ msgid: msg.msgid, status: 'error', msg: 'no-settings' });
				msg.data = data;
			}
			nativePort.postMessage(msg);
		});

		port.onDisconnect.addListener(function (msg) {
			log('port.onDisconnect');
			if (nativePort) {
				nativePort.disconnect();
				nativePort = null;
			}
		});
	});

})(chrome.runtime);