
/* customers template */

// TODO: yet not supported
//const cmn = require('../common.catalog');

let template = {
    properties: {
		"TCustomer.$rowMark"() {
			//return this.Amount === 22.0 ? 'warning' : '';
			return this.Amount === 22.0 ? 'success' : '';
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

    }
};

//alert('template created:' + template);

module.exports = template;