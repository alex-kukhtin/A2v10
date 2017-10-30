
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
            }
			return this.Amount === 22.0 ? 'red' : '';
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