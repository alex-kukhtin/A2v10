// Copyright © 2015-2021 Alex Kukhtin. All rights reserved.

/*20210502-7773*/
/* services/accel.js */

app.modules['std:accel'] = function () {

	const _elems = [];
	let _listenerAdded = false;
	let _key = 42;

	return {
		registerControl,
		unregisterControl
	};

	function _keyDownHandler(ev) {
		// control/alt/shift/meta
		let code = ev.code;
		// console.dir(code);
		if (code === 'NumpadEnter')
			code = "Enter";
		const keyAccel = `${ev.ctrlKey ? 'C' : '_'}${ev.altKey ? 'A' : '_'}${ev.shiftKey ? 'S' : '_'}${ev.metaKey ? 'M' : '_'}:${code}`;
		let el = _elems.find(x => x.accel === keyAccel);
		if (!el || !el.handlers || !el.handlers.length) return;
		let handler = el.handlers[0];
		if (handler.action === 'focus') {
			ev.preventDefault();
			ev.stopPropagation();
			Vue.nextTick(() => {
				if (typeof handler.elem.focus === 'function')
					handler.elem.focus();
			});
		} else if (handler.action == 'func') {
			ev.preventDefault();
			ev.stopPropagation();
			Vue.nextTick(() => {
				if (typeof handler.elem === 'function')
					handler.elem();
			});
		}
	}

	function setListeners() {
		if (_elems.length > 0) {
			if (_listenerAdded)
				return;
			document.addEventListener('keydown', _keyDownHandler, false);
			_listenerAdded = true;
			//console.dir('set listener')
		} else {
			if (!_listenerAdded)
				return;
			document.removeEventListener('keydown', _keyDownHandler, false);
			_listenerAdded = false;
			//console.dir('remove listener')
		}
	}

	function registerControl(accel, elem, action) {
		let key = _key++;
		var found = _elems.find(c => c.accel === accel);
		if (found)
			found.handlers.unshift({ key, elem, action });
		else
			_elems.push({ accel: accel, handlers: [{ key, elem, action }] });
		setListeners();
		return key;
	}

	function unregisterControl(key) {
		var found = _elems.findIndex(c => c.handlers.findIndex(x => x.key === key) != -1);
		if (found == -1) {
			console.error('Invalid accel handler');
			return;
		}
		let elem1 = _elems[found];
		elem1.handlers.shift();
		if (!elem1.handlers.length)
			_elems.splice(found, 1);
		setListeners();
	}
};
