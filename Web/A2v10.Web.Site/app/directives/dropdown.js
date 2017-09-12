/*20170911-7030*/
/* directives/dropdown.js */

Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		//console.warn('bind drop down');

		const popup = require('std:popup');
		let me = this;

		el._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');
		// el.focus();
		if (!el._btn) {
			console.error('DropDown does not have a toggle element');
		}

		popup.registerPopup(el);

		el._close = function (ev) {
			if (el._hide)
				el._hide();
			el.classList.remove('show');
		};

		/*
		el.addEventListener('blur', function (event) {
			if (el._close) el._close(event);
		}, true);
		*/

		el.addEventListener('click', function (event) {
			let trg = event.target;
			while (trg) {
				if (trg === el._btn) break;
				if (trg === el) return;
				trg = trg.parentElement;
			}
			if (trg === el._btn) {
				event.preventDefault();
				let isVisible = el.classList.contains('show');
				if (isVisible) {
					if (el._hide)
						el._hide();
					el.classList.remove('show');
				} else {
					if (el._show)
						el._show();
					el.classList.add("show");
				}
			}
		});
	},
	unbind(el) {
		//console.warn('unbind drop down');
		const popup = require('std:popup');
		popup.unregisterPopup(el);
	}
});

