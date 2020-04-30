
/* index template */

const posTerm = require('pos/posterm');

const template = {
	properties: {
		'TRoot.$style': String,
		'TRoot.$text'() {
			return 'button text';
		}
	},
	methods: {
	},
	events: {
	},
	validators: {
	},
	commands: {
		showAlert() {
			alert('click!');
		},
		connect,
		xReport,
		serviceInOut
	}
};

module.exports = template;

async function connect() {
	let res = await posTerm.connect();
	console.dir(res);
};

async function xReport() {
	let res = await posTerm.xReport();
	console.dir(res);
};

async function serviceInOut() {
	// create receipt
	let res = await posTerm.serviceInOut({ out: false, amount: 10.00, openCashDrawer: true });
	// fix receipt
	console.dir(res);
}