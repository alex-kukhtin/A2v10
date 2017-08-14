
describe("DataModel", function () {

    const cmn = require('datamodel');

    function createCustomer(source, template) {
        function TCustomer(source, path, parent) {
            cmn.createObject(this, source, path, parent);
        }

        // metadata
        cmn.defineObject(TCustomer, {
            Id: Number,
            Name: String,
            Amount: Number
        }, /* array item */ false);

        let ctors = {
            TCustomer
        };

        cmn.implementRoot(TCustomer, template, ctors);

        return new TCustomer(source);
    }

    it("Create simple object", function () {

        let customer = createCustomer({ Id: 55, Name: 'Customer Name' });

        expect(customer.Id).toBe(55);
        expect(customer.Name).toBe('Customer Name');
        expect(customer.Amount).toBe(0);
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

});


