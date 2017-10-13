
/* customers template */

// TODO: yet not supported
const cmn = require('common/module1');

//alert(cmn.X);

let template = {
    properties: {
		"TCustomer.$rowMark"() {
			//return this.Amount === 22.0 ? 'warning' : '';
			return this.Amount === 22.0 ? 'yellow' : '';
		},
		"TCustomer.$cellMark"() {
			//return this.Amount >= 500 ? 'danger' : '';
			return this.Amount === 40000 ? 'success' : '';
		}
    },
    events: {
    },
    validators: {
		"Customers[].Name": "Обязательное поле"
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

module.exports = template;