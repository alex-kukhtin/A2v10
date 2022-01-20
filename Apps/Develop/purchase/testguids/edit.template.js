
let template = {
	properties: {
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
		}
	}
};

module.exports = template;

