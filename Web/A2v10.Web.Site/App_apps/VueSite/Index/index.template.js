

const template = {
	properties: {
		'THome.$ItemId'() { return "Id:" + this.Id; }
	},
	validators: {
		'Home.Text': 'Enter text here!'
	},
	commands: {
		sayHello() {
			alert('hello!');
		}
	}
};

module.exports = template;
