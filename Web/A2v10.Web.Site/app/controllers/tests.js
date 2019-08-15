// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20180815-7523*/

(function () {

	const store = component('std:store');
	const eventBus = require('std:eventBus');

	let __lastInvokeResult = undefined;

	window.__tests__ = {
		$navigate: navigate,
		$isReady: function () {
			console.dir('from isReady:' + window.__requestsCount__);
			return document.readyState === 'complete' &&
				window.__requestsCount__ + window.__loadsCount__ === 0;
		},
		$invoke: function (args) {
			if (args.target === 'shell') 
				invoke(args);
			else
				eventBus.$emit('invokeTest', args);
			return args.result;
		},
		$lastResult() {
			return __lastInvokeResult;
		}
	};

	function navigate(url) {
		store.commit('navigate', { url: url });
	}

	function invoke(args) {
		__lastInvokeResult = undefined;
		const http = require('std:http');
		const root = window.$$rootUrl;
		const routing = require('std:routing');
		const url = `${root}/${routing.dataUrl()}/invoke`;
		const data = {
			cmd: args.cmd,
			baseUrl: `/_page${args.path}/index/${args.id}`,
			data: null
		};
		http.post(url, JSON.stringify(data))
			.then(r => {
				args.result = `success:${r}`;
				__lastInvokeResult = args.result;
			})
			.catch(err => {
				args.result = `error:${err}`;
				__lastInvokeResult = args.result;
			});
	}

})();