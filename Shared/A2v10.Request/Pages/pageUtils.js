// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

//20210619-7785

Vue.directive('focus', {
	bind: function(el, binding, vnode) {

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
	inserted: function (el) {
		if (el.tabIndex === 1) {
			setTimeout(function() {
				if (el.focus) el.focus();
				if (el.select) el.select();
			}, 0);
		}
	}
});

async function post(url, data) {
	try {
		var response = await fetch(url, {
			method: 'POST',
			headers: {
				'X-Requested-With': 'XMLHttpRequest',
				'Accept': 'application/json;charset=utf-8',
				"__RequestVerificationToken": token
			},
			body: JSON.stringify(data)
		});
		switch (response.status) {
			case 200:
				return await response.json();
			case 255:
				return await response.text() || response.statusText;
		}
	} catch (err) {
		if (err instanceof Error)
			throw err.message
		else
			throw err;
	}
}

function parseQueryString(str) {
	var obj = {};
	str.replace(/\??([^=&]+)=([^&]*)/g, function (m, key, value) {
		obj[decodeURIComponent(key)] = '' + decodeURIComponent(value);
	});
	return obj;
}


function getReferralUrl(url) {
	let qs = parseQueryString(window.location.search.toLowerCase());
	let ref = qs.ref || '';
	if (ref)
		return url + '?ref=' + ref;
	return url;
}

function validEmail(addr) {

	// from chromium ? https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
	const EMAIL_REGEXP= /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
	return addr === '' || EMAIL_REGEXP.test(addr);
}

//20180729-7259
/*components/popover.js*/

Vue.component('popover', {
	template: 
'<div v-dropdown class="popover-wrapper" :style="{top: top}">' +
	'<span toggle class="popover-title"><i v-if="hasIcon" :class="iconClass"></i> <span :title="title" v-text="content"></span></span>' +
	'<div class="popup-body" :style="{width: width}">' +
		'<div class="arrow" />' +
		'<div v-if="visible">' +
			'<include :src="popoverUrl"/>' +
		'</div>' +
		'<slot />' +
	'</div>' +
'</div>',
	/*
	1. Если добавить tabindex="-1" для toggle, то можно сделать закрытие по blur
	2. можно добавить кнопку закрытия. Любой элемент с атрибутом close-dropdown
	<span class="close" close-dropdown style="float:right">x</span >
	*/

	data: function() {
		return {
			state: 'hidden',
			popoverUrl: ''
		};
	},
	props: {
		icon: String,
		url: String,
		content: String,
		title: String,
		width: String,
		top: String
	},
	computed: {
		hasIcon: function() {
			return !!this.icon;
		},
		iconClass: function() {
			let cls = "ico po-ico";
			if (this.icon)
				cls += ' ico-' + this.icon;
			return cls;
		},
		visible: function() {
			return this.url && this.state === 'shown';
		}
	},
	mounted: function () {
		let this_ = this;
		this.$el._show = function() {
			this_.state = 'shown';
			if (this_.url)
				this_.popoverUrl = '/_popup' + this_.url;
		};
		this.$el._hide = function () {
			this_.state = 'hidden';
			this_.popoverUrl = '';
		};
		//this.state = 'shown';
	}
});

function getPopup() {

	let __dropDowns__ = [];
	let __started = false;

	let __error = 'Perhaps you forgot to create a _close function for popup element';


	return {
		startService: startService,
		registerPopup: registerPopup,
		unregisterPopup: unregisterPopup,
		closeAll: closeAllPopups,
		closest: closest,
		closeInside: closeInside
	};

	function registerPopup(el) {
		__dropDowns__.push(el);
	}

	function unregisterPopup(el) {
		let ix = __dropDowns__.indexOf(el);
		if (ix !== -1)
			__dropDowns__.splice(ix, 1);
		delete el._close;
	}

	function startService() {
		if (__started)
			return;

		__started = true;

		document.body.addEventListener('click', closePopups);
		document.body.addEventListener('contextmenu', closePopups);
		document.body.addEventListener('keydown', closeOnEsc);
	}


	function closest(node, css) {
		if (node) return node.closest(css);
		return null;
	}

	function closeAllPopups() {
		__dropDowns__.forEach( function(el) {
			if (el._close)
				el._close(document);
		});
	}

	function closeInside(el) {
		if (!el) return;
		// inside el only
		let ch = el.querySelectorAll('.popover-wrapper');
		for (let i = 0; i < ch.length; i++) {
			let chel = ch[i];
			if (chel._close) {
				chel._close();
			}
		}
	}

	function closePopups(ev) {
		if (__dropDowns__.length === 0)
			return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (closest(ev.target, '.dropdown-item') ||
				ev.target.hasAttribute('close-dropdown') ||
				closest(ev.target, '[dropdown-top]') !== el) {
				if (!el._close) {
					throw new Error(__error);
				}
				el._close(ev.target);
			}
		}
	}

	// close on esc
	function closeOnEsc(ev) {
		if (ev.which !== 27) return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (!el._close)
				throw new Error(__error);
			el._close(ev.target);
		}
	}
}


(function () {

	const popup = getPopup();

	popup.startService();

	Vue.directive('dropdown', {
		bind: function(el, binding, vnode) {

			let me = this;

			el._btn = el.querySelector('[toggle]');
			el.setAttribute('dropdown-top', '');
			// el.focus(); // ???
			if (!el._btn) {
				console.error('DropDown does not have a toggle element');
			}

			popup.registerPopup(el);

			el._close = function (ev) {
				if (el._hide)
					el._hide();
				el.classList.remove('show');
			};

			el.addEventListener('click', function (event) {
				let trg = event.target;
				while (trg) {
					if (trg === el._btn) break;
					if (trg === el) return;
					trg = trg.parentElement;
				}
				if (trg === el._btn) {
					event.preventDefault();
					event.stopPropagation();
					let isVisible = el.classList.contains('show');
					if (isVisible) {
						if (el._hide)
							el._hide();
						el.classList.remove('show');
					} else {
						// not nested popup
						let outer = popup.closest(el, '.popup-body');
						if (outer) {
							popup.closeInside(outer);
						} else {
							popup.closeAll();
						}
						if (el._show)
							el._show();
						el.classList.add('show');
					}
				}
			});
		},
		unbind: function(el) {
			if (!window.require) return;
			const popup = require('std:popup');
			popup.unregisterPopup(el);
		}
	});
})();
