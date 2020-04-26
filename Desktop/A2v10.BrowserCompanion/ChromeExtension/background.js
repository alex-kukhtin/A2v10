(function (runtime) {

	console.info('a2v10 browser companion. Background started');

	const DEBUG = true;
	const hostName = "com.a2v10.companion";

	function log(msg) {
		if (!DEBUG)
			return;
		console.dir(msg);
	}

	runtime.onConnectExternal.addListener(function (port, sender) {

		log('connect external (background.js)')

		let nativePort = runtime.connectNative(hostName);
		let externalPort = port;

		nativePort.onMessage.addListener(function(msg, port) {
			// response message;
			log('nativePort.onMessage');
			externalPort.postMessage(msg);
		});

		port.onMessage.addListener(function (msg, port) {
			log('port.onMessage');
			log(msg);
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