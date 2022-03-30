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

	it("ensure type (number)", function () {
		expect(utils.ensureType(Number, undefined)).toBe(0);
		expect(utils.ensureType(Number, "23455")).toBe(23455);
	});

	it("ensure type (string)", function () {
		expect(utils.ensureType(String, undefined)).toBe('');
		expect(utils.ensureType(String, "S")).toBe("S");
		expect(utils.ensureType(String, 234)).toBe("234");
	});

	it("ensure type (boolean)", function () {
		expect(utils.ensureType(Boolean, undefined)).toBe(false);
		expect(utils.ensureType(Boolean, true)).toBe(true);
		expect(utils.ensureType(Boolean, 'true')).toBe(true);
		expect(utils.ensureType(Boolean, '1')).toBe(true);
		expect(utils.ensureType(Boolean, false)).toBe(false);
		expect(utils.ensureType(Boolean, 1)).toBe(true);
		expect(utils.ensureType(Boolean, 'false')).toBe(false);
	});
});

