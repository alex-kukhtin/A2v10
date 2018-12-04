
describe("DataModel", function () {

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

	it("Create simple object", function () {

		let customer = td.createCustomer({ Id: 55, Name: 'Customer Name' });

		expect(customer.Id).toBe(55);
		expect(customer.Name).toBe('Customer Name');
		expect(customer.Amount).toBe(0);
	});

	it("Create empty object", function () {
		let empty = td.createCustomer();
		expect(empty.Id).toBe(0);
		expect(empty.Name).toBe('');
		expect(empty.Amount).toBe(0);
	});

	it("RowCount for Array ", function () {
		// RowCount
		let root = td.createCustomerArray({
			Customers: [],
			'Customers.$RowCount': 7
		});
		//console.dir(root);
		expect(root.Customers.length).toBe(0);
		expect(root.Customers.$RowCount).toBe(7);
	});

	it("Get/set data", function () {

		let customer = td.createCustomer({ Id: 55, Name: 'Customer Name' });

		expect(customer.Amount).toBe(0);
		customer.Amount = 524.22;
		customer.Name = "New customer name";
		expect(customer.Amount).toBe(524.22);
		expect(customer.Name).toBe("New customer name");
		// invalid property type
		customer.Amount = 'string';
		expect(customer.Amount).toBe(0);
	});


	it("Enumerate props (simple)", function () {
		// simple object
		let customer = td.createCustomer({ Id: 55, Name: 'Customer Name' });
		let arr = [];
		for (let val of cmn.enumData(customer, '', "Name")) {
			arr.push(val);
		}
		expect(arr.length).toBe(1);
		expect(arr[0].val === 'Customer Name');
	});

	it("Enumerate props (array)", function () {
		// simple array
		let root = td.createCustomerArray({ Customers: [{ Name: "FIRST" }, { Name: "SECOND" }] });
		expect(root.Customers.length).toBe(2);
		let arr = [];
		for (let val of cmn.enumData(root, 'Customers[]', 'Name')) {
			arr.push(val);
		}
		expect(arr.length).toBe(2);
		expect(arr[0].val === 'FIRST');
		expect(arr[1].val === 'SECOND');
	});

	it("Enumerate props (empty object)", function () {
		// empty object
		let root = td.createCustomerArray();
		let arr = [];
		for (let val of cmn.enumData(root, 'Customers[]', 'Name')) {
			arr.push(val);
		}
		expect(arr.length).toBe(0);
	});

	it("Enumerate props (complex object)", function () {
		// complex object
		let root = td.createDocument(docToTest);
		let arr = [];
		for (let val of cmn.enumData(root, 'Document.Rows[].Entity', 'Name')) {
			arr.push(val);
		}
		//console.dir(arr);
		expect(arr.length).toBe(2);
		expect(arr[0].val === 'Entity 16');
		expect(arr[1].val === 'Entity 17');
		expect(arr[0].item.Name === 'Entity 16');
		expect(arr[1].item.Name === 'Entity 17');
		expect(arr[0].ix === ':0');
		expect(arr[1].ix === ':1');
	});

	it("Get/set objects", function () {

		let root = td.createDocument(docToTest);

		let doc = root.Document;

		expect(doc.Id).toBe(55);
		expect(doc.Rows.length).toBe(2);
		expect(doc.Rows[0].Id).toBe(100);
		expect(doc.Rows[1].Id).toBe(101);

		let row1 = doc.Rows[0];
		expect(row1.Entity.Id).toBe(16);
		expect(row1.Entity._path_).toBe("Document.Rows[].Entity"); // valid path

		// copy from another object
		row1.Entity = root.Entities[0];
		expect(row1.Entity.Id).toBe(26);
		expect(row1.Entity._path_).toBe("Document.Rows[].Entity");
		row1.Entity.Name = "from test";
		expect(root.Entities[0].Name).toBe('Entity 26');
		// clear
		row1.Entity.$empty();
		expect(row1.Entity.Id).toBe(0);
		expect(row1.Entity.Name).toBe('');
		expect(row1.Entity._path_).toBe("Document.Rows[].Entity");

		row1.Entity = root.Entities[1];
		expect(row1.Entity.Id).toBe(27);
		expect(row1.Entity.Name).toBe("Entity 27");
		expect(row1.Entity._path_).toBe("Document.Rows[].Entity");

		row1.Entity = null;
		expect(row1.Entity.Id).toBe(0);
		expect(row1.Entity.Name).toBe('');
		expect(row1.Entity._path_).toBe("Document.Rows[].Entity");

		row1.Entity = { Id: 99, Name: 'Simple Name' };
		expect(row1.Entity.Id).toBe(99);
		expect(row1.Entity.Name).toBe('Simple Name');
		expect(row1.Entity._path_).toBe("Document.Rows[].Entity");
	});

	it("$append/$prepend (array)", function () {
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

	it("$rowNumber (array)", function () {
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

	it('$append, $remove, $sort', function () {
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
});


