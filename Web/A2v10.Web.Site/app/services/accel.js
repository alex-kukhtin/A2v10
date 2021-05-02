// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210502-7773*/
/* services/accel.js */

app.modules['std:accel'] = function () {

	const _elems = [];
	let _listenerAdded = false;

	return {
		registerControl,
		unregisterControl
	};

	function _keyDownHandler(ev) {
		// control/alt/shift/meta
		const keyAccel = `${ev.ctrlKey ? 'C' : '_'}${ev.altKey ? 'A' : '_'}${ev.shiftKey ? 'S' : '_'}${ev.metaKey ? 'M' : '_'}:${ev.code}`;
		let el = _elems.find(x => x.accel === keyAccel);
		if (!el) return;
		if (el.action === 'focus') {
			Vue.nextTick(() => {
				ev.preventDefault();
				ev.stopPropagation();
				el.elem.focus();
			});
		} else if (el.action == 'func') {
			Vue.nextTick(() => {
				ev.preventDefault();
				ev.stopPropagation();
				el.elem();
			});
		}
	}

	function setListeners() {
		if (_elems.length > 0) {
			if (_listenerAdded)
				return;
			document.addEventListener('keydown', _keyDownHandler, false);
			_listenerAdded = true;
		} else {
			if (!_listenerAdded)
				return;
			document.removeEventListener('keydown', _keyDownHandler, false);
		}
	}

	function registerControl(accel, elem, action) {
		var found = _elems.findIndex(c => c.elem === elem);
		if (found === -1)
			_elems.push({ elem: elem, accel: accel, action: action});
		setListeners();
	}

	function unregisterControl(elem) {
		var found = _elems.findIndex(c => c.elem === elem);
		if (found !== -1)
			_elems.splice(found);
	}
};
