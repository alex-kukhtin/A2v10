// Copyright © 2020 Alex Kukhtin. All rights reserved.

(function () {

	const key = 'pos.settings';
	let ls = window.localStorage;

	let model = document.getElementById('model');
	let port = document.getElementById('port');
	let baud = document.getElementById('baud');
	let terminal = document.getElementById('terminal');

	document.getElementById('set').addEventListener('click', function () {
		let settings = { model: model.value, port: port.value, baud: +baud.value, terminal: terminal.value };

		ls.setItem(key, JSON.stringify(settings));
	});

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

})();