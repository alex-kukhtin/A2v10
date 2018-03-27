describe("Date tools", function () {

	const utils = require('std:utils');
	const du = utils.date;

	it("compare dates (1)", function () {
		let d1 = new Date(2018, 1, 2);
		let d2 = new Date(2018, 1, 3);
		expect(du.compare(d1, d2)).toBeLessThan(0);
		expect(du.compare(d2, d1)).toBeGreaterThan(0);
		expect(du.compare(d1, d1)).toBe(0);
		expect(du.compare(d2, d2)).toBe(0);
	});

	it("compare dates (2)", function () {
		let d1 = du.today();
		let d2 = du.today();
		d2.setHours(12);
		expect(du.compare(d1, d2)).toBeLessThan(0);
		expect(du.compare(d2, d1)).toBeGreaterThan(0);
		expect(du.compare(d1, d1)).toBe(0);
		expect(du.compare(d2, d2)).toBe(0);
	});

	it("date equal", function () {
		let d1 = du.today();
		let d2 = du.today();
		d2.setHours(12);
		expect(du.equal(d1, d2)).toBe(true);
		d1 = new Date(2018, 1, 2);
		d2 = new Date(2018, 1, 3);
		expect(du.equal(d1, d2)).toBe(false);
	});
});

