/**
 * edit customer
 */

const eventBus = require('std:eventBus');
const http = require('std:http');

function __myEvent(arg) {
	//console.dir(this);
	//console.dir(arg);
}

const template = {
	options: {
		skipDirty: ['Agent.Code']
	},
	properties: {
		'TRoot.$$tabVisible': Boolean,
		'TAgent.$SelectedMime': String,
		'TAgent.$EditArg'() { return { Id: this.Id };},
		'TAgent.$Test': String
	},
	events: {
		"Model.load": modelLoad,
		"Model.unload": modelUnload
	},
	validators: {
		"Agent.Name": {
			valid: function (ag) {
				return ag.Name === 'W';
			},
			msg: 'warning validator: must be "W"',
			severity: 'info'
		},
		"Agent.Code":
			{ valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" }
	},
	delegates: {
		uploadAttachment,
		canClose
	},
	commands: {
		runTest: {
			exec: runTest,
			canExec() { return this.$ready; } // return this.$vm && !this.$vm.$isLoading; }
		}
	}
};

function modelLoad(root) {
	const ag = root.Agent;
	console.dir(root);
	ag.$Test = 223.4455;
	//console.dir(root.$isCopy);
	if (ag.$isNew)
		customerCreate(ag);
	eventBus.$on('myEvent', __myEvent);

	/*
	let url = 'https://maps.google.com/maps/api/geocode/json?address=%D0%B2%D1%83%D0%BB%D0%B8%D1%86%D1%8F%20%D0%93%D0%B5%D0%BD%D0%B5%D1%80%D0%B0%D0%BB%D0%B0%20%D0%9D%D0%B0%D1%83%D0%BC%D0%BE%D0%B2%D0%B0,%2023%D0%90&%20key=asdasdasd123q131233'
	http.get(url)
		.then(function () {
			alert('success');
		}).catch(function () {
			alert('error');
		});
	*/
}

function modelUnload(root) {
	//console.dir({event: 'unload', root, this_: this });
	eventBus.$off('myEvent', __myEvent);
}

function customerCreate(ag) {
	ag.Kind = 'Supplier';
}

function duplicateCode(agent, code) {
	var vm = agent.$vm;
	if (!agent.Code)
		return true;
	return vm.$asyncValid('duplicateCode', { Code: agent.Code, Id: agent.Id });
}


function uploadAttachment(result) {
	console.dir(this);
	console.dir(result);
	let coll = this.Agent.Attachments;
	for (let i = 0; i < result.length; i++)
		coll.$append(result[i]);
}
module.exports = template;

function runTest() {
	this.$ctrl.$alert("message");
	this.$ctrl.$requery();
	/*
	let args = { target: 'controller', testId: 'SupplierProps', action: 'eval', path: 'Agent.Id', result: undefined};
	//window.__tests__.$invoke(args);

	this.$ctrl.$invoke('getNumber', { Num: Math.PI });
	console.dir(args.result);

	//this.$ctrl.$invoke('sleep');
	*/
}

function canClose() {
	console.dir(this);
	return true;
}