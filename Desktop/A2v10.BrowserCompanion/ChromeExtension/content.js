(function () {
	console.dir('content script started');
	console.dir("id:" + chrome.runtime.id);
	console.dir(chrome.runtime.connect);



	window.addEventListener("pos-message", function (event) {
		console.dir('pos-message on content')
		chrome.runtime.sendMessage('bnlgbjcldhehamppfcmpphccccikbbao', event);
		var obj = JSON.stringify({ x: 5, y: 32 });
		chrome.runtime.sendMessage('bnlgbjcldhehamppfcmpphccccikbbao', obj, undefined, function (resp) {
			console.dir('response for pos-message');
			console.dir(response);
		});
	}, false);

	window.addEventListener("message", function (event) {
		console.dir('from listener');
		console.dir(event);
	}, false);
})();
