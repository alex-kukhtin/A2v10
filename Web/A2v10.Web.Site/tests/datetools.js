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

	it('date add (year)', function () {
		let d1 = du.today();
		let d2 = du.add(d1, 1, 'year');
		expect(du.equal(d1, d2)).toBe(false);
		expect(d2.getFullYear()).toBe(d1.getFullYear() + 1);
		d2 = du.add(d1, -1, 'year');
		expect(d2.getFullYear()).toBe(d1.getFullYear() - 1);
	});

	it('date add (month)', function () {
		let d1 = new Date(2018, 1, 28); // 28 feb
		let d2 = du.add(d1, 1, 'month');
		expect(du.equal(d1, d2)).toBe(false);
		expect(d2.getMonth()).toBe(d1.getMonth() + 1);
		expect(d2.getDate()).toBe(d1.getDate());

		d1 = new Date(2018, 0, 31); // 31 jan
		d2 = du.add(d1, 1, 'month');
		expect(d2.getMonth()).toBe(d1.getMonth() + 1);
		expect(d2.getDate()).toBe(28);
		d2 = du.add(d2, 1, 'month');
		expect(d2.getDate()).toBe(28);
		expect(d2.getMonth()).toBe(2); // 28 mar

		d1 = new Date(2018, 0, 31); // 31 jan
		d2 = du.add(d1, -1, 'month');
		expect(d2.getMonth()).toBe(11);
		expect(d2.getDate()).toBe(31);
		expect(d2.getFullYear()).toBe(2017);
	});

	it('date add (day)', function () {
		let d1 = du.today();
		let d2 = du.add(d1, 1, 'day');
		expect(du.equal(d1, d2)).toBe(false);
		expect(d2.getTime() - d1.getTime()).toBe(1000 * 60 * 60 * 24);
		d2 = du.add(d1, -1, 'day');
		expect(d2.getTime() - d1.getTime()).toBe(-1000 * 60 * 60 * 24);
	});

	it('date add (hour)', function () {
		let d1 = new Date(2018, 1, 2);
		let d2 = du.add(d1, 1, 'hour');
		expect(du.equal(d1, d2)).toBe(true);
		expect(d2.getHours()).toBe(1);
		d1.setHours(23);
		d2 = du.add(d1, 1, 'hour');
		expect(d2.getDate()).toBe(3);
		d2 = du.add(d1, -1, 'hour');
		expect(d2.getDate()).toBe(2);
	});

	it('date add (minutes)', function () {
		let d1 = new Date(2018, 1, 2);
		let d2 = du.add(d1, 10, 'minute');
		expect(du.equal(d1, d2)).toBe(true);
		expect(d2.getMinutes()).toBe(10);
		d1.setHours(23);
		d1.setMinutes(59);
		d2 = du.add(d1, 1, 'minute');
		expect(d2.getDate()).toBe(3);
		d2 = du.add(d1, -1, 'minute');
		expect(d2.getDate()).toBe(2);
	});

	it('date add (seconds)', function () {
		let d1 = new Date(2018, 1, 2);
		let d2 = du.add(d1, 20, 'second');
		expect(du.equal(d1, d2)).toBe(true);
		expect(d2.getSeconds()).toBe(20);
		d1.setHours(23);
		d1.setMinutes(59);
		d1.setSeconds(59);
		d2 = du.add(d1, 1, 'second');
		expect(d2.getDate()).toBe(3);
		d2 = du.add(d1, -1, 'second');
		expect(d2.getDate()).toBe(2);
	});

	it('end of month', function () {
		let d1 = new Date(2018, 1, 2); // 2 feb
		let eom = du.endOfMonth(d1);
		expect(eom.getDate()).toBe(28);
		d1.setMonth(2); // mar
		eom = du.endOfMonth(d1);
		expect(eom.getDate()).toBe(31);
		d1.setYear(2016); // leap
		d1.setMonth(1); // feb
		eom = du.endOfMonth(d1);
		expect(eom.getDate()).toBe(29);
	});

	it('date diff (month) ', function () {
		let d1 = new Date(2018, 1, 2); // 2 feb
		let d2 = new Date(2018, 5, 15); // 15 jun
		let f = du.diff("month", d1, d2);
		expect(f).toBe(4);

		d1 = new Date(2018, 1, 2); // 2 feb
		d2 = new Date(2018, 5, 1); // 1 jun
		f = du.diff("month", d1, d2);
		expect(f).toBe(3);

		d1 = new Date(2018, 1, 2); // 2 feb
		d2 = new Date(2019, 5, 15); // 15 jun
		f = du.diff("month", d1, d2);
		expect(f).toBe(16);

		d1 = new Date(2018, 1, 2); // 2 feb
		d2 = new Date(2019, 5, 2); // 2 jun
		f = du.diff("month", d1, d2);
		expect(f).toBe(16);

		f = du.diff("month", d2, d1);
		expect(f).toBe(16);

		d1 = new Date(2018, 1, 15); // 15 feb
		d2 = new Date(2019, 5, 1); // 1 jun
		f = du.diff("month", d1, d2);
		expect(f).toBe(15);
	});

	it('format date', function () {
		let d1 = new Date(2018, 1, 2); // 2 feb
		let f = du.formatDate(d1);
		expect(f).toBe('01.02.2018');
	});

});

