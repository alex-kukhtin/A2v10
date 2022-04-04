
let template = {
	properties: {
		'TItem.Value': String,
		'TRoot.$disable': Boolean,
		'TRoot.$Elements'() { return this.Elements.filter(x => !this.$disable); }
	},
	validators: {
		'Item.Elem': 'select option'
	},
	events: {
	},
	commands: {
		clear() {
			this.$disable = !this.$disable;
		},
		emitCall() {
			this.Item.Elem.$empty();
			this.Item.Value = '';
			//this.$ctrl.$emitCaller('from.dialog', { Id: 33, X: 'string' });
		}
	}
};

module.exports = template;

