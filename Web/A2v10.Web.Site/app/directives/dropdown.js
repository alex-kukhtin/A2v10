// Copyright © 2015-2022 Alex Kukhtin. All rights reserved.

/*20220823-7883*/
/* directives/dropdown.js */

(function () {

	const popup = require('std:popup');
	const eventBus = require('std:eventBus');

	Vue.directive('dropdown', {
		bind(el, binding, vnode) {

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

			el.addEventListener('mouseup', (ev) => {
				// from children elements
				eventBus.$emit('closeAllPopups');
				ev.stopPropagation();
			});

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