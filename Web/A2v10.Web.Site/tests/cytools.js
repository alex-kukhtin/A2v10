// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

describe("Currency tools", function () {

	const utils = require('std:utils');
	const locale = require('std:locale');

	const ct = utils.currency;

	const numLocale = locale.$Locale;
	const numberFormat = new Intl.NumberFormat(numLocale, { minimumFractionDigits: 2, maximumFractionDigits: 6, useGrouping: true }).format;

	const sep1000 = numberFormat(1000)[1];
	const sepDec = numberFormat(1000)[5];

	it("round", function () {
		expect(ct.round(0.833333, 2)).toBe(0.83);
		expect(ct.round(0.833333, 4)).toBe(0.8333);
		expect(ct.round(0.845, 2)).toBe(0.85);
		expect(ct.round(-7.2123, 3)).toBe(-7.212);
		expect(ct.round(-7.2128, 3)).toBe(-7.213);
		expect(ct.round(-7.2150, 2)).toBe(-7.22);
		expect(ct.round(248.9950, 2)).toBe(249);
		expect(ct.round(248.85, 0)).toBe(249);
	});

	it("format", function () {
		expect(ct.format(0)).toBe(`0${sepDec}00`);
		expect(ct.format(248)).toBe(`248${sepDec}00`);
		expect(ct.format(1248.56)).toBe(`1${sep1000}248${sepDec}56`);
	});

});

