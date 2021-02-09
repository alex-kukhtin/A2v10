// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210209-7445*/
/* directives/dropdown.js */


Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		const popup = require('std:popup');
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
			if (el._btn.disabled) return;
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
	unbind(el) {
		const popup = require('std:popup');
		popup.unregisterPopup(el);
	}
});

