
describe("Validators", function () {

	const val = require('std:validators');

	it("notBlank (string - rule as string)", function () {
		let rule = 'blank message';
		// not blank
		expect(
			val.validate(rule, null, 'string')
		).toEqual([]);

		// blank
		expect(
			val.validate(rule, null, '')
		).toEqual([{ msg: 'blank message', severity: 'error' }]);

	});


	it('notBlank (string - rule as object)', function () {
		let rule = { valid: 'notBlank', msg: 'another message', severity: 'warning' };
		// not blank
		expect(
			val.validate(rule, null, 'string')
		).toEqual([]);

		// blank
		expect(
			val.validate(rule, null, '')
		).toEqual([{ msg: 'another message', severity: 'warning' }]);
	});

	it("notBlank (number - rule as string)", function () {
		let rule = 'blank message';

		// not blank
		expect(
			val.validate(rule, null, 234)
		).toEqual([]);

		// blank
		expect(
			val.validate(rule, null, 0)
		).toEqual([{ msg: 'blank message', severity: 'error' }]);
		expect(true).toBe(true);
	});

	it("rule.valid as function", function () {

		function isValid(item, val) {
			return item.test === val;
		}

		let rule = { valid: isValid, msg: 'error message' };
		let item = { test: 'test' };

		// valid
		expect(
			val.validate(rule, item, 'test')
		).toEqual([]);

		// not valid
		expect(
			val.validate(rule, item, 'test1')
		).toEqual([{ msg: 'error message', severity: 'error' }]);

	});

	it("array of rules", function () {

		function isValid(item, val) {
			return item.test === val;
		}

		let rules = [
			"valid is blank",
			{ valid: isValid, msg: 'error message' }
		];

		let item = { test: 'test' };

		// valid
		expect(
			val.validate(rules, item, 'test')
		).toEqual([]);

		// not valid
		expect(
			val.validate(rules, item, 'test1')
		).toEqual([{ msg: 'error message', severity: 'error' }]);

		expect(
			val.validate(rules, item, '')
		).toEqual([
			{ msg: 'valid is blank', severity: 'error' },
			{ msg: "error message", severity: 'error' }
		]);
	});

	it("valid function that returns a string", function () {
		function isValid(item, val) {
			return item.test === val ? true : `error ${val}`;
		}

		let rule = { valid: isValid, msg: 'error message', severity: 'info' };

		let item = { test: 'test' };

		// valid
		expect(
			val.validate(rule, item, 'test')
		).toEqual([]);

		// not valid
		expect(
			val.validate(rule, item, 'test1')
		).toEqual([{ msg: 'error test1', severity: 'info' }]);
	});

});

