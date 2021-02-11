
describe("DataModel arrays", function () {

	const cmn = require('std:datamodel');
	const td = require('std:testdata');

	const docToTest = {
		Document: {
			Id: 55, Rows: [
				{ Id: 100, Entity: { Id: 16, Name: 'Entity 16' } },
				{ Id: 101, Entity: { Id: 17, Name: 'Entity 17' } }
			]
		},
		Entities: [
			{ Id: 26, Name: 'Entity 26' },
			{ Id: 27, Name: 'Entity 27' }
		]
	};


	it("$append/$prepend", function () {
		// simple array
		let root = td.createCustomerArray({ Customers: [{ Name: "FIRST" }, { Name: "SECOND" }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		let newCust = arr.$append({ Name: 'THIRD' });
		expect(arr.length).toBe(3);
		expect(arr[2] === newCust);
		newCust = arr.$prepend({ Name: 'FOURTH' });
		expect(arr.length).toBe(4);
		expect(arr[0] === newCust);
	});

	it("$rowNumber", function () {
		// array with row number
		let root = td.createCustomerArray({ Customers: [{ Name: "FIRST", RowNo:1 }, { Name: "SECOND", RowNo:2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		expect(arr[0].RowNo).toBe(1);
		expect(arr[1].RowNo).toBe(2);

		let newCust = arr.$append({ Name: 'THIRD' });
		expect(arr.length).toBe(3);
		expect(arr[2] === newCust);
		expect(arr[2].RowNo).toBe(3);

		newCust = arr.$prepend({ Name: 'FOURTH' });
		expect(arr.length).toBe(4);
		expect(arr[0] === newCust);
		expect(arr[0].RowNo).toBe(1);
		expect(arr[3].RowNo).toBe(4);
	});

	it('$append/$remove/$sort', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		expect(arr[0].RowNo).toBe(1);
		expect(arr[1].RowNo).toBe(2);

		let newCust = arr.$append({ Name: '3. THIRD' });
		expect(arr.length).toBe(3);
		expect(arr[2] === newCust);
		expect(arr[2].RowNo).toBe(3);

		arr.$sort(function (a, b) {
			// descend
			return a.Name === b.Name ? 0 : a.Name < b.Name ? 1 : -1;
		});
		expect(arr[0].RowNo).toBe(1);
		expect(arr[0].Name).toBe("3. THIRD");

		arr[0].$remove();

		expect(arr[0].RowNo).toBe(1);
		expect(arr[0].Name).toBe("2. SECOND");
		expect(arr[1].RowNo).toBe(2);
		expect(arr[1].Name).toBe("1. FIRST");

		arr.$remove(arr[0]);
		arr.$remove(arr[0]);
		expect(arr.length).toBe(0);
	});

	it('$empty', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		arr.$empty();
		expect(arr.length).toBe(0);
	});

	it('$remove', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		arr.$remove(arr[0]);
		expect(arr.length).toBe(1);
		expect(arr[0].RowNo).toBe(1); // renumber rows
	});

	it('$remove (item)', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		arr[0].$remove();
		expect(arr.length).toBe(1);
		expect(arr[0].RowNo).toBe(1); // renumber rows
	});

	it('$find', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		let found = arr.$find(x => x.Name === '2. SECOND');
		expect(found.RowNo).toBe(2);
	});

	it('$copy', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);
		arr.$copy([{ Name: '3. THIRD' }]);
		expect(arr.length).toBe(1);
		expect(arr[0].RowNo).toBe(1);
		expect(arr[0].Name).toBe('3. THIRD');
	});

	it('$select', function () {
		let root = td.createCustomerArray({ Customers: [{ Name: "1. FIRST", RowNo: 1 }, { Name: "2. SECOND", RowNo: 2 }] });
		let arr = root.Customers;
		expect(arr.length).toBe(2);

		arr[0].$select();
		expect(arr.$selected.RowNo).toBe(1);
		expect(arr[0].$selected).toBe(true);
		expect(arr[1].$selected).toBe(false);

		arr.$select(arr[1]);
		expect(arr.$selected.RowNo).toBe(2);
		expect(arr[0].$selected).toBe(false);
		expect(arr[1].$selected).toBe(true);

		arr.$clearSelected();
		expect(arr.$selected).toBe(undefined);
		expect(arr[0].$selected).toBe(false);
		expect(arr[1].$selected).toBe(false);
	});

});


