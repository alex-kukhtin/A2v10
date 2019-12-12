// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20191211-7596*/
/* services/accel.js */

app.modules['std:accel'] = function () {

	let elems = [];
	let _listenerAdded = false;

	return {
		registerControl,
		unregisterControl
	};

	function _keyDownHandler(ev) {
		console.dir(ev);
	}

	function setListeners() {
		if (elems.length > 0) {
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

	function registerControl(accel, elem) {
		var found = elems.findIndex(c => c.elem === elem);
		if (found === -1)
			elems.push({ elem: elem, accel: accel });
		setListeners();
	}

	function unregisterControl(elem) {
		var found = elems.findIndex(c => c.elem === elem);
		if (found !== -1)
			elems.splice(found);
	}
};
