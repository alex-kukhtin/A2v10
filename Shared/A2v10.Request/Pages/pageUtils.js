// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

Vue.directive('focus', {
	bind(el, binding, vnode) {

		el.addEventListener("focus", function (event) {
			event.target.parentElement.classList.add('focus');
		}, false);

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = false;
			event.target.parentElement.classList.remove('focus');
		}, false);

		el.addEventListener("click", function (event) {
			let t = event.target;
			if (t._selectDone)
				return;
			t._selectDone = true;
			if (t.select) t.select();
		}, false);
	},
	inserted(el) {
		if (el.tabIndex === 1) {
			setTimeout(() => {
				if (el.focus) el.focus();
				if (el.select) el.select();
			}, 0);
		}
	}
});

function post(url, data) {
	return new Promise(function (resolve, reject) {
		let xhr = new XMLHttpRequest();

		xhr.onload = function (response) {
			if (xhr.status === 200) {
				let xhrResult = JSON.parse(xhr.responseText);
				resolve(xhrResult);
			}
			else if (xhr.status === 255) {
				reject(xhr.responseText || xhr.statusText);
			}
			else
				reject(xhr.statusText);
		};
		xhr.onerror = function (response) {
			reject(xhr.statusText);
		};
		xhr.open('POST', url, true);
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.setRequestHeader('Accept', 'application/json;charset=utf-8');
		xhr.setRequestHeader("__RequestVerificationToken", token);
		xhr.send(JSON.stringify(data));
	});
}

function parseQueryString(str) {
	var obj = {};
	str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
		obj[decodeURIComponent(key)] = '' + decodeURIComponent(value);
	});
	return obj;
}


function validEmail(addr) {
	/* from angular.js !!! */
	const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+\/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
	return addr === '' || EMAIL_REGEXP.test(addr);
}
