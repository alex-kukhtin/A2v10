
describe("Validators", function () {

	const val = require('std:validators');

	let blankArray = [];
	blankArray.pending = 0;

	it("notBlank (string - rule as string)", function () {
		let rule = 'blank message';
		// not blank
		expect(
			val.validate(rule, null, 'string')
		).toEqual(blankArray);

		// blank

		let result = [{ msg: 'blank message', severity: 'error' }];
		result.pending = 0;
		expect(
			val.validate(rule, null, '')
		).toEqual(result);

	});


	it('notBlank (string - rule as object)', function () {
		let rule = { valid: 'notBlank', msg: 'another message', severity: 'warning' };
		// not blank
		expect(
			val.validate(rule, null, 'string')
		).toEqual(blankArray);

		// blank
		let result = [{ msg: 'another message', severity: 'warning' }];
		result.pending = 0;
		expect(
			val.validate(rule, null, '')
		).toEqual(result);
	});

	it("notBlank (number - rule as string)", function () {
		let rule = 'blank message';

		// not blank
		expect(
			val.validate(rule, null, 234)
		).toEqual(blankArray);

		// blank
		let result = [{ msg: 'blank message', severity: 'error' }];
		result.pending = 0;
		expect(
			val.validate(rule, null, 0)
		).toEqual(result);
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
		).toEqual(blankArray);

		// not valid
		let result = [{ msg: 'error message', severity: 'error' }];
		result.pending = 0;
		expect(
			val.validate(rule, item, 'test1')
		).toEqual(result);

	});

	it("rule as function", function () {
		function isValid(item, val) {
			return item.test === val ? "" : "invalid element";
		}

		let rule = isValid;
		let item = { test: 'test' };

		// valid
		expect(
			val.validate(rule, item, 'test')
		).toEqual(blankArray);

		// not valid
		let result = [{ msg: 'invalid element', severity: 'error' }];
		result.pending = 0;
		expect(
			val.validate(rule, item, 'test1')
		).toEqual(result);

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
		).toEqual(blankArray);

		// not valid
		let result = [{ msg: 'error message', severity: 'error' }];
		result.pending = 0;
		expect(
			val.validate(rules, item, 'test1')
		).toEqual(result);

		result = [
			{ msg: 'valid is blank', severity: 'error' },
			{ msg: "error message", severity: 'error' }
		];
		result.pending = 0;

		expect(
			val.validate(rules, item, '')
		).toEqual(result);
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
		).toEqual(blankArray);

		// not valid
		let result = [{ msg: 'error test1', severity: 'info' }];
		result.pending = 0;
		expect(
			val.validate(rule, item, 'test1')
		).toEqual(result);
	});

	it('applyIf', function () {
		function applyIf(obj, name) {
			return obj.id === 22;
		}

		function isValid() {
			console.dir('is valid');
			return false;
		}

		let rule = { valid: isValid, msg: 'error message', applyIf: applyIf };

		// not applied
		expect(
			val.validate(rule, {id: 23}, 'id')
		).toEqual(blankArray);

		// applied
		let result = [{ msg: 'error message', severity:'error'}];
		result.pending = 0;
		expect(
			val.validate(rule, { id: 22 }, 'id')
		).toEqual(result);
	});
});

