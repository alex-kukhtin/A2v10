// Copyright © 2020 Alex Kukhtin. All rights reserved.

(function () {

	const key = 'pos.settings';
	let ls = window.localStorage;

	let isDirty = false;

	let model = document.getElementById('model');
	let port = document.getElementById('port');
	let baud = document.getElementById('baud');
	let terminal = document.getElementById('terminal');
	let sharename = document.getElementById('sharename');
	let setbtn = document.getElementById('set');

	setbtn.addEventListener('click', function () {
		if (!isDirty)
			return;
		let settings = { model: model.value, port: port.value, baud: +baud.value, terminal: terminal.value, sharename: sharename.value };
		ls.setItem(key, JSON.stringify(settings));
		isDirty = false;
		setbtn.disabled = true;
	});

	for (var ctrl of [port, baud, terminal, sharename])
		ctrl.addEventListener('change', setDirty)

	model.addEventListener("change", function (ev) {
		showControls();
		setDirty();
	});

	function setDirty() {
		isDirty = true;
		setbtn.disabled = false;
	}

	function showControls() {
		const named = ['ESC-POS', 'WINDOWS']
		let nameVisible = named.indexOf(model.value) !== -1;
		if (nameVisible) {
			port.parentNode.classList.add('hidden');
			baud.parentNode.classList.add('hidden');
			sharename.parentNode.classList.remove('hidden');
		} else {
			port.parentNode.classList.remove('hidden');
			baud.parentNode.classList.remove('hidden');
			sharename.parentNode.classList.add('hidden');
		}
		setbtn.disabled = true;
		isDirty = false;
	}


	for (let i = 1; i < 16; i++) {
		let name = 'COM' + i;
		let opt = document.createElement('option');
		opt.setAttribute('value', name);
		opt.innerText = name;
		port.appendChild(opt);
	}

	let s = window.localStorage.getItem(key);
	if (s)
		s = JSON.parse(s);
	else
		s = {};

	model.value = s.model || 'DATECS-Krypton';
	port.value = s.port || 'COM1';
	baud.value = s.baud || 19200;
	terminal.value = s.terminal || '';
	sharename.value = s.sharename || '';
	showControls();

})();