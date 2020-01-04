

const template = {
	properties: {
		'THome.$ItemId'() { return "Id:" + this.Id; }
	},
	validators: {
		'Home.Text': 'Enter text here!'
	},
	events: {
		"Model.load": modelLoad
	},
	commands: {
		sayHello() {
			alert('hello!');
			this.Home.Text = 'Hello from tempalte!';
		}
	}
};

module.exports = template;

function modelLoad(root) {
	console.dir(root);
}