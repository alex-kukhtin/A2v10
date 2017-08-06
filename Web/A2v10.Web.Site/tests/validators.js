
describe("Validators", function () {

    let val = require('validators');

    it("notBlank (string - rule as string)", function () {
        let rule = 'blank message';
        // not blank
        expect(
            val.validate(rule, null, 'string')
        ).toBe(null);

        // blank
        expect(
            val.validate(rule, null, '')
        ).toEqual([{msg: 'blank message', severity: 'error'}]);

    });


    it('notBlank (string - rule as object)', function () {
        let rule = { valid: 'notBlank', msg: 'another message', severity: 'warning' };
        // not blank
        expect(
            val.validate(rule, null, 'string')
        ).toBe(null);

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
        ).toBe(null);

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
        ).toBe(null);

        // not valid
        expect(
            val.validate(rule, item, 'test1')
        ).toEqual([{ msg: 'error message', severity: 'error' }]);

    });

});


