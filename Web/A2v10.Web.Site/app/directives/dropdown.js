// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

/*20221027-7902*/
/* directives/dropdown.js */

(function () {

	const popup = require('std:popup');

	Vue.directive('dropdown', {
		bind(el, binding, vnode) {

			el.setAttribute('dropdown-top', '');
			popup.registerPopup(el);

			el._close = function (ev) {
				if (el._hide)
					el._hide();
				el.classList.remove('show');
			};

			el._findButton = function() {
				let btn = el.querySelector('[toggle]');
				if (!btn) {
					console.error('DropDown does not have a toggle element');
				}
				return btn;
			}

			el._handler = function(event) {
				let trg = event.target;
				let btn = el._findButton(el);
				if (!btn || btn.disabled) return;
				while (trg) {
					if (trg === btn) break;
					if (trg === el) return;
					trg = trg.parentElement;
				}
				if (trg === btn) {
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
			}

			el.addEventListener('click', el._handler);
		},
		unbind(el) {
			const popup = require('std:popup');
			popup.unregisterPopup(el);
			el.removeEventListener('click', el._handler);
		}
	});

	Vue.directive('contextmenu', {
		_contextMenu(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			ev.target.click();
			let menu = document.querySelector('#' + this._val);
			let br = menu.parentNode.getBoundingClientRect();
			let style = menu.style;
			style.top = (ev.clientY - br.top) + 'px';
			style.left = (ev.clientX - br.left) + 'px';
			menu.classList.add('show');
		},
		bind(el, binding) {
			binding._val = binding.value;
			el.addEventListener('contextmenu', binding.def._contextMenu.bind(binding));
		},
		unbind(el, binding) {
			el.removeEventListener('contextmenu', binding.def._contextMenu.bind(binding));
		}
	});

})();