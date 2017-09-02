/*20170902-7023*/
/* directives/dropdown.js */

Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		//console.warn('bind drop down');

		const popup = require('std:popup');
		let me = this;

		el._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');

		popup.registerPopup(el);

		el._close = function (ev) {
			el.classList.remove('show');
		};

		el.addEventListener('click', function (event) {
			if (event.target === el._btn) {
				event.preventDefault();
				let isVisible = el.classList.contains('show');
				if (isVisible)
					el.classList.remove('show');
				else {
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

