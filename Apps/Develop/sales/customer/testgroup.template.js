/*customer index template*/


const template = {
	properties: {
		'TRoot.$Item': Object,
		'TData.$Mark'() { console.dir(this.$level); return this.$level == 1 ? 'red' : ''; }
	},
	commands: {
	},
	events: {
		"Model.load":modelLoad
	},
	delegates: {
		fetch() {
			return [];
		}
	}
};


function modelLoad() {
	console.dir(this.RepData);
}

module.exports = template;

