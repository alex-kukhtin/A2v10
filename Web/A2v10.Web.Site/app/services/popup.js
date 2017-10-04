/*20170829-7022*/
/* services/popup.js */

app.modules['std:popup'] = function () {

	const __dropDowns__ = [];
	let __started = false;

	const __error = 'Perhaps you forgot to create a _click function for popup element';


	return {
		startService: startService,
		registerPopup: registerPopup,
		unregisterPopup: unregisterPopup,
		closeAll: closeAllPopups
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
		__dropDowns__.forEach((el) => {
			if (el._close)
				el._close(document);
		});
	}

	function closePopups(ev) {
		if (__dropDowns__.length === 0)
			return;
		for (let i = 0; i < __dropDowns__.length; i++) {
			let el = __dropDowns__[i];
			if (closest(ev.target, '.dropdown-item') ||
				ev.target.hasAttribute('close-dropdown') ||
				closest(ev.target, '[dropdown-top]') !== el) {
				if (!el._close)
					throw new Error(__error);
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
};

