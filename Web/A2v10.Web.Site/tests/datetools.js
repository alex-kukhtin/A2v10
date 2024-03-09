// Copyright © 2015-2020 Alex Kukhtin. All rights reserved.

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

		d1 = du.create(2020, 02, 29);
		d2 = du.add(d1, 1, 'year');
		expect(d2.getTime()).toBe(du.create(2021, 03, 01).getTime());

		d2 = du.add(d1, -1, 'year');
		expect(d2.getTime()).toBe(du.create(2019, 03, 01).getTime());
	});

	it('date add (month)', function () {
		let d1 = du.create(2018, 2, 28); // 28 feb
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

		d1 = new Date(2018, 9, 28);
		eom = du.endOfMonth(d1);
		expect(eom.getDate()).toBe(31);
	});

	it('date diff (day) ', function () {
		let d1 = new Date(2018, 1, 2); // 2 feb
		let d2 = new Date(2018, 1, 15); // 15 feb
		let f = du.diff("day", d1, d2);
		expect(f).toBe(13);

		d1 = new Date(2024, 2, 30); // 30 mar
		d2 = new Date(2024, 2, 31); // 31 apr
		f = du.diff("day", d1, d2);
		expect(f).toBe(1);

		d1 = new Date(2024, 2, 31); // 31 mar
		d2 = new Date(2024, 3, 1); //  01 apr
		f = du.diff("day", d1, d2);
		expect(f).toBe(1);

		d1 = new Date(2024, 2, 30); // 30 mar
		d2 = new Date(2024, 3, 1); //  01 apr
		f = du.diff("day", d1, d2);
		expect(f).toBe(2);

		d1 = new Date(2024, 2, 10); // 10 mar
		d2 = new Date(2024, 2, 31); //  31 mar
		f = du.diff("day", d1, d2);
		expect(f).toBe(21);
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

	it('date diff (year) ', function () {
		let d1 = new Date(2018, 1, 2); // 2 feb
		let d2 = new Date(2019, 5, 15); // 15 jun
		let f = du.diff("year", d1, d2);
		expect(f).toBe(1);

		d1 = new Date(2019, 5, 2); // 2 jun
		d2 = new Date(2018, 1, 1); // 1 feb
		f = du.diff("year", d1, d2);
		expect(f).toBe(1);

		d1 = new Date(2019, 1, 1);
		d2 = new Date(2018, 1, 2);
		f = du.diff("year", d1, d2);
		expect(f).toBe(0);

		d1 = new Date(2018, 1, 2); // 2 feb
		d2 = new Date(2020, 1, 2); // 2 feb
		f = du.diff("year", d1, d2);
		expect(f).toBe(2);
	});

	it('format date', function () {
		let d1 = new Date(2018, 1, 2); // 2 feb
		let f = du.formatDate(d1);
		expect(f).toBe('02.02.2018');
	});

	it('from days', function () {
		let f = du.fromDays(25327);
		expect(f.getTime()).toBe(new Date('Mon May 05 1969 00:00:00 GMT+0300').getTime());
		f = du.fromDays(23451);
		expect(f.getTime()).toBe(new Date('Mon Mar 16 1964 00:00:00 GMT+0300').getTime());
	});

	it('parse date', function () {
		let today = du.today();
		expect(du.parse('01.01.2019').getTime()).toBe(du.create(2019, 1, 1).getTime());
		expect(du.parse('01 / 01 / 19').getTime()).toBe(du.create(2019, 1, 1).getTime());
		expect(du.parse('01 \.. 01 ... 19').getTime()).toBe(du.create(2019, 1, 1).getTime());
		expect(du.parse('01 .,\\/: 01 ; 19').getTime()).toBe(du.create(2019, 1, 1).getTime());
		expect(du.parse('16.03').getTime()).toBe(du.create(today.getFullYear(), 3, 16).getTime());
		expect(du.parse('16.').getTime()).toBe(du.create(today.getFullYear(), today.getMonth() + 1, 16).getTime());
		expect(du.parse('01abc\.. 01 dsess# 19').getTime()).toBe(du.create(2019, 1, 1).getTime());
		expect(du.parse('2020-09-25T09:51:29.250').getTime()).toBe(new Date('2020-09-25T09:51:29.250').getTime());
		expect(du.parse('2020-09-25T09:51:29').getTime()).toBe(new Date('2020-09-25T09:51:29.000').getTime());
	});

	it('try parse date', function () {
		let today = du.today();
		expect(du.tryParse(today).getTime()).toBe(today.getTime());
		expect(du.tryParse('Mon May 05 1969').getTime()).toBe(new Date('Mon May 05 1969 00:00:00 GMT+0300').getTime());
		expect(du.tryParse('Mon May 05 1969 03:00:00 GMT+0300').getTime()).toBe(new Date('Mon May 05 1969 00:00:00 GMT+0300').getTime());
		expect(du.tryParse('20190502').getTime()).toBe(du.create(2019, 5, 2).getTime());
		expect(du.tryParse('2009-02-15T00:00:00').getTime()).toBe(du.create(2009, 2, 15).getTime());
		expect(du.tryParse('"\\/\"2020-09-01T00:00:00"\\/"').getTime()).toBe(du.create(2020, 9, 1).getTime());
		expect(du.tryParse('2020-09-25T09:51:29.250').getTime()).toBe(new Date('2020-09-25T09:51:29.250').getTime());
		expect(du.tryParse('2020-09-25T09:51:29').getTime()).toBe(new Date('2020-09-25T09:51:29.000').getTime());
	});
});

