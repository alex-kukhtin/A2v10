// Copyright © 2021 Oleksandr Kukhtin. All rights reserved.

// 20210502-7773
// components/accelcommand.js

const maccel = require('std:accel');

(function () {
	Vue.component('a2-accel-command', {
		props: {
			accel: String,
			command: Function
		},
		render() {
		},
		mounted() {
			if (this.accel)
				this._key = maccel.registerControl(this.accel, this.command, 'func');
		},
		beforeDestroy() {
			if (this.accel)
				maccel.unregisterControl(this._key);
		},
	});
})();