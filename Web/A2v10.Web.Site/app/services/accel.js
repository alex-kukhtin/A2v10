// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191211-7596*/
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
				el.elem.focus();
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
			_elems.push({ elem: elem, accel: accel, action: action });
		setListeners();
	}

	function unregisterControl(elem) {
		var found = _elems.findIndex(c => c.elem === elem);
		if (found !== -1)
			_elems.splice(found);
	}
};
