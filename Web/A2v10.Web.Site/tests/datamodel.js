
describe("DataModel", function () {

    const cmn = require('std:datamodel');

    function createCustomer(source, template) {
        function TCustomer(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        // metadata
        cmn.defineObject(TCustomer, {
            props: {
                Id: Number,
                Name: String,
                Amount: Number
            }
        }, /* array item */ false);

        let ctors = {
            TCustomer
        };

        cmn.implementRoot(TCustomer, template, ctors);

        return new TCustomer(source);
    }

    function createCustomerArray(source, template) {

        function TCustomer(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        function TRoot(source) {
            cmn.createObject(this, source, '', this);
        }

        function TCustomerArray(source, path, parent) {
            return cmn.createArray(source, path, TCustomer, TCustomerArray, parent);
        }

        // metadata
        cmn.defineObject(TCustomer, {
            props: {
                Id: Number,
                Name: String,
                Amount: Number
            }
        }, /* array item */ true);

        cmn.defineObject(TRoot, {
            props: {
                Customers: TCustomerArray
            }
        }, /* array item */ false);

        let ctors = {
            TCustomer,
            TRoot
        };

        cmn.implementRoot(TRoot, template, ctors);

        return new TRoot(source);
    }

    it("Create simple object", function () {

        let customer = createCustomer({ Id: 55, Name: 'Customer Name' });

        expect(customer.Id).toBe(55);
        expect(customer.Name).toBe('Customer Name');
        expect(customer.Amount).toBe(0);
    });

    it("Create empty object", function () {
        let empty = createCustomer();
        expect(empty.Id).toBe(0);
        expect(empty.Name).toBe('');
        expect(empty.Amount).toBe(0);
    });

    it("RowCount for Array ", function () {
        // RowCount
        let root = createCustomerArray({
            Customers: [],
            'Customers.$RowCount': 7
        });
        console.dir(root);
        expect(root.Customers.length).toBe(0);
        expect(root.Customers.$RowCount).toBe(7);
    });

    it("Get/set data", function () {

        let customer = createCustomer({ Id: 55, Name: 'Customer Name' });

        expect(customer.Amount).toBe(0);
        customer.Amount = 524.22;
        customer.Name = "New customer name";
        expect(customer.Amount).toBe(524.22);
        expect(customer.Name).toBe("New customer name");
        // invalid property type
        customer.Amount = 'string';
        expect(customer.Amount).toBe(0);
    });


    it("Enumerate props", function () {
        // simple object
        let customer = createCustomer({ Id: 55, Name: 'Customer Name' });
        let arr = [];
        for (let val of cmn.enumData(customer, '', "Name")) {
            arr.push(val);
        }
        expect(arr.length).toBe(1);
        expect(arr[0].val === 'Customer Name');

        // simple array
        let root = createCustomerArray({ Customers: [{ Name: "FIRST" }, { Name: "SECOND" }] });
        expect(root.Customers.length).toBe(2);
        arr = [];
        for (let val of cmn.enumData(root, 'Customers[]', 'Name')) {
            arr.push(val);
        }
        expect(arr.length).toBe(2);
        expect(arr[0].val === 'FIRST');
        expect(arr[1].val === 'SECOND');

        // empty object
        root = createCustomerArray();
        arr = [];
        for (let val of cmn.enumData(root, 'Customers[]', 'Name')) {
            arr.push(val);
        }
        expect(arr.length).toBe(0);

        // TODO: complex object
    });

});


