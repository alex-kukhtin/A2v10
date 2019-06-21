// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

describe("Format", function () {

	const utils = require('std:utils');
	const locale = require('std:locale');

	const numLocale = locale.$Locale;
	const numberFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 2, maximumFractionDigits: 6, useGrouping: true }).format;

	const sep1000 = numberFormat(1000)[1];
	const sepDec = numberFormat(1000)[5];


	it("simple format", function () {
		expect(utils.format(0.833, "Number")).toBe('0,833');
		expect(utils.format(0, "Number")).toBe('0');
		expect(utils.format(1024, "Number")).toBe(`1${sep1000}024`);
	});

	it("custom format", function () {
		expect(utils.format(12.3427, "Number", { format: '0.00' })).toBe(`12${sepDec}34`);
		expect(utils.format(12.3427, "Number", { format: '0.00##' })).toBe(`12${sepDec}3427`);
		expect(utils.format(12.3427, "Number", { format: '0' })).toBe('12');
		expect(utils.format(1223.3427, "Number", { format: '#,000.00' })).toBe(`1${sep1000}223${sepDec}34`);
		expect(utils.format(12, "Number", { format: '000' })).toBe('012');
		expect(utils.format(1200, "Number", { format: '#,000.00' })).toBe(`1${sep1000}200${sepDec}00`);
	});
});

