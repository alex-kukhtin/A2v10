/*20170829-7022*/
/* directives/dropdown.js */

Vue.directive('dropdown', {
	bind(el, binding, vnode) {

		const popup = require('std:popup');
		let me = this;

		me.isVisible = function (el) {
			return el.classList.contains('show');
		};

		me._btn = el.querySelector('[toggle]');
		el.setAttribute('dropdown-top', '');

		popup.registerPopup(el);

		el._close = function (ev) {
			el.classList.remove('show');
		};

		el.addEventListener('click', function (event) {
			if (event.target === me._btn) {
				event.preventDefault();
				if (me.isVisible(el))
					el.classList.remove('show');
				else {
					el.classList.add("show");
				}
			}
		});
	},
	unbind(el) {
		const popup = require('std:popup');
		popup.unregisterPopup(el);
	}
});


