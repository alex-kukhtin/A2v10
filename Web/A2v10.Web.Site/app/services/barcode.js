// Copyright © 2023 Oleksandr Kukhtin. All rights reserved.

/*20230224-7921*/
/* services/barcode.js */

app.modules['std:barcode'] = function () {

	const checksum = (number) => {
		let res = number
			.substr(0, 12)
			.split('')
			.map(n => +n)
			.reduce((sum, a, idx) => (idx % 2 ? sum + a * 3 : sum + a), 0);
		return (10 - (res % 10)) % 10;
	};

	return {
		generateEAN13
	};

	function generateEAN13(prefix, data) {
		let len = 13;
		let maxCodeLen = len - prefix.length - 2;
		data = '' + (+data % +('1' + '0'.repeat(maxCodeLen)));
		let need = (len - 1) - ('' + prefix).length - data.length;
		let fill = '0'.repeat(need);
		let code = `${prefix}${fill}${data}`;
		return code + checksum(code);
	}
};
