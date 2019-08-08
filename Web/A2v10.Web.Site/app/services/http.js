// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190808-7517
/* services/http.js */

app.modules['std:http'] = function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	let fc = null;

	return {
		get: get,
		post: post,
		load: load,
		upload: upload,
		localpost
	};

	function blob2String(blob, callback) {
		const fr = new FileReader();
		fr.addEventListener('loadend', (e) => {
			const text = fr.result;
			callback(text);
		});
		fr.readAsText(blob);
	}

	function doRequest(method, url, data, raw) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					if (raw) {
						resolve(xhr.response);
						return;
					}
					let ct = xhr.getResponseHeader('content-type') || '';
					let xhrResult = xhr.responseText;
					if (ct && ct.indexOf('application/json') !== -1)
						xhrResult = xhr.responseText ? JSON.parse(xhr.responseText) : '';
					resolve(xhrResult);
				}
				else if (xhr.status === 255) {
					if (raw) {
						if (xhr.response instanceof Blob)
							blob2String(xhr.response, (msg) => reject('server error: ' + msg));
						else
							reject(xhr.statusText); // response is blob!
					}
					else
						reject(xhr.responseText || xhr.statusText);
				} else if (xhr.status === 473 /*non standard */) {
					if (xhr.statusText === 'Unauthorized') {
						// go to login page
						window.location.assign('/');
					}
				}
				else
					reject(xhr.statusText);
			};
			xhr.onerror = function (response) {
				eventBus.$emit('endRequest', url);
				reject(xhr.statusText);
			};
			xhr.open(method, url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'application/json, text/html');
			if (raw)
				xhr.responseType = "blob";
			eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function get(url, raw) {
		return doRequest('GET', url, null, raw);
	}

	function post(url, data, raw) {
		return doRequest('POST', url, data, raw);
	}

	function upload(url, data) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();
			xhr.onload = function (response) {
				eventBus.$emit('endRequest', url);
				if (xhr.status === 200) {
					let xhrResult = xhr.responseText ? JSON.parse(xhr.responseText) : '';
					resolve(xhrResult);
				} else if (xhr.status === 255) {
					reject(xhr.responseText || xhr.statusText);
				}
			};
			xhr.onerror = function (response) {
				alert('Error');
			};
			xhr.open("POST", url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'application/json');
			eventBus.$emit('beginRequest', url);
			xhr.send(data);
		});
	}

	function load(url, selector, baseUrl) {
		let fc = selector ? selector.firstElementChild : null;
		if (fc && fc.__vue__) {
			fc.__vue__.$destroy();
		}
		return new Promise(function (resolve, reject) {
			doRequest('GET', url)
				.then(function (html) {
					if (html.startsWith('<!DOCTYPE')) {
						// full page - may be login?
						window.location.assign('/');
						return;
					}
					let dp = new DOMParser();
					let rdoc = dp.parseFromString(html, 'text/html');
					// first element from fragment body
					let srcElem = rdoc.body.firstElementChild;
					let elemId = srcElem.id || null;
					selector.innerHTML = srcElem ? srcElem.outerHTML : '';
					if (elemId && !document.getElementById(elemId)) {
						selector.innerHTML = '';
						resolve(false);
						return;
					}
					for (let i = 0; i < rdoc.scripts.length; i++) {
						let s = rdoc.scripts[i];
						if (s.type === 'text/javascript') {
							let newScript = document.createElement("script");
							if (s.src)
								newScript.src = s.src;
							else
								newScript.text = s.text;
							document.body.appendChild(newScript).parentNode.removeChild(newScript);
						}
					}
					if (selector.firstElementChild && selector.firstElementChild.__vue__) {
						let fec = selector.firstElementChild;
						let ve = fec.__vue__;
						ve.$data.__baseUrl__ = baseUrl || urlTools.normalizeRoot(url);
						// save initial search
						ve.$data.__baseQuery__ = urlTools.parseUrlAndQuery(url).query;
						if (fec.classList.contains('modal')) {
							let dca = fec.getAttribute('data-controller-attr');
							if (dca)
								eventBus.$emit('modalSetAttribites', dca, ve);
						}
					}
					resolve(true);
				})
				.catch(function (error) {
					reject(error);
				});
		});
	}

	function localpost(command, data) {
		return new Promise(function (resolve, reject) {
			let xhr = new XMLHttpRequest();

			xhr.onload = function (response) {
				if (xhr.status === 200) {
					let ct = xhr.getResponseHeader('content-type');
					let xhrResult = xhr.responseText;
					if (ct.indexOf('application/json') !== -1)
						xhrResult = JSON.parse(xhr.responseText);
					resolve(xhrResult);
				}
				else if (xhr.status === 255) {
					reject(xhr.responseText || xhr.statusText);
				}
				else {
					reject(xhr.statusText);
				}
			};
			xhr.onerror = function (response) {
				reject(response);
			};
			let url = "http://127.0.0.1:64031/" + command;
			xhr.open("POST", url, true);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.setRequestHeader('Accept', 'text/plain');
			xhr.setRequestHeader('Content-Type', 'text/plain');
			xhr.send(data);
		});
	}
};




