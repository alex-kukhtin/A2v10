
/* customers template */

// TODO: yet not supported
const cmn = require('common/module1');

//alert(cmn.X);

let template = {
    properties: {
		"TCustomer.$rowMark"() {
            //return this.Amount === 22.0 ? 'warning' : '';
            switch (this.Amount) {
                case 22: return 'red';
                case 33: return 'yellow';
                case 44: return 'cyan';
                case 55: return 'green';
                case 77: return 'green';
            }
			return this.Amount === 22.0 ? 'red' : '';
		},
		"TCustomer.$cellMark"() {
			//return this.Amount >= 500 ? 'danger' : '';
			return this.Amount === 40000 ? 'success' : '';
        },
        "TCustomer.$rowBold"() {
            //return this.Amount >= 500 ? 'danger' : '';
            return this.Amount === 99;
        },
        "TCustomer.$Icon"() {
            return this.Id === 100 ? "image" : 'file';
        }
    },
    events: {
        "Customers[].select": customersSelect
    },
    validators: {
		"Customers[].Name": "Обязательное поле"
    },
    delegates: {
        TestFilter(val, filter) {
            console.dir(val);
            return val.Name.toLowerCase().indexOf(filter.Filter.toLowerCase()) !== -1;
        }
    },
    commands: {
		TEST: TEST
    }
};


function TEST(arg) {
	// THIS = root
	let vm = this.$vm;
	vm.$invoke('invokeSql', arg, 'catalog/customers')
	.then((result) => {
		console.dir(result);
		alert(result.Customer.Id);
	});
}
//alert('template created:' + template);


function customersSelect(arr, elem) {
    console.dir(elem);
}
module.exports = template;