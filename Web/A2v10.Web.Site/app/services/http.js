// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

// 20210611-7783
/* services/http.js */

app.modules['std:http'] = function () {

	const eventBus = require('std:eventBus');
	const urlTools = require('std:url');

	return {
		get,
		post,
		load,
		upload,
		localpost
	};

	async function doRequest(method, url, data, raw, skipEvents) {
		if (!skipEvents)
			eventBus.$emit('beginRequest', url);
		try {
			var response = await fetch(url, {
				method,
				mode: 'same-origin',
				headers: {
					'X-Requested-With': 'XMLHttpRequest',
					'Accept': 'application/json, text/html'
				},
				body: data
			});
			let ct = response.headers.get("content-type");
			switch (response.status) {
				case 200:
					if (raw)
						return await response.blob();
					if (ct.startsWith('application/json'))
						return await response.json();
					return await response.text();
					break;
				case 255:
					let txt = response.statusText;
					if (ct.startsWith('text/'))
						txt = await response.text();
					throw txt;
				case 473: /*non standard */
					if (response.statusText === 'Unauthorized') {
						// go to login page
						setTimeout(() => {
							window.location.assign('/');
						}, 10)
						throw '__blank__';
					}
					break;
				default:
					throw response.statusText;
			}
		}
		catch (err) {
			throw err;
		}
		finally {
			if (!skipEvents)
				eventBus.$emit('endRequest', url);
		}
	}

	function get(url, raw) {
		return doRequest('GET', url, null, raw);
	}

	function post(url, data, raw, skipEvents) {
		return doRequest('POST', url, data, raw, skipEvents);
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
		if (selector) {
			let fc = selector.firstElementChild
			if (fc && fc.__vue__) {
				let ve = fc.__vue__;
				ve.$destroy();
				ve.$el.remove();
				ve.$el = null;
				fc.__vue__ = null;
			}
			selector.innerHTML = '';
		}

		return new Promise(function (resolve, reject) {
			eventBus.$emit('beginLoad');
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
					rdoc.body.remove();
					resolve(true);
					eventBus.$emit('endLoad');
				})
				.catch(function (error) {
					reject(error);
					eventBus.$emit('endLoad');
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




