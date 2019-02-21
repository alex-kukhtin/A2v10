// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

describe("Format", function () {

	const utils = require('std:utils');

	function get1000sep() {
		return Number(1000).toLocaleString()[1];
	}

	let sep = get1000sep();


	it("simple format", function () {
		expect(utils.format(0.833, "Number")).toBe('0.833');
		expect(utils.format(0, "Number")).toBe('0');
		expect(utils.format(1024, "Number")).toBe(`1${sep}024`);
	});

	it("custom format", function () {
		expect(utils.format(12.3427, "Number", {format:'0.00'})).toBe('12.34');
		expect(utils.format(12.3427, "Number", { format: '0.00##' })).toBe('12.3427');
		expect(utils.format(12.3427, "Number", { format: '0' })).toBe('12');
		expect(utils.format(1223.3427, "Number", { format: '#,000.00' })).toBe(`1${sep}223.34`);
		expect(utils.format(12, "Number", { format: '000' })).toBe('012');
		expect(utils.format(1200, "Number", { format: '#,000.00' })).toBe(`1${sep}200.00`);
	});
});

