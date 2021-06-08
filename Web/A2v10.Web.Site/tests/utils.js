// Copyright © 2021 Alex Kukhtin. All rights reserved.

describe("Utilities", function () {

	const utils = require('std:utils');

	function f() {

	};

	let p = new Promise((resolve, reject) => { });
	let d = new Date();

	it("is functions", function () {
		expect(utils.isFunction(f)).toBe(true);
		expect(utils.isFunction(p)).toBe(false);
		expect(utils.isPromise(p)).toBe(true);
		expect(utils.isPromise(f)).toBe(false);
		expect(utils.isString('')).toBe(true);
		expect(utils.isString(f)).toBe(false);
		expect(utils.isNumber(1)).toBe(true);
		expect(utils.isBoolean(true)).toBe(true);
	});

	it("is date", function () {
		expect(utils.isDateCtor(Date)).toBe(true);
		expect(utils.isDate(d)).toBe(true);
		expect(utils.isObject(d)).toBe(true);
	});

});

