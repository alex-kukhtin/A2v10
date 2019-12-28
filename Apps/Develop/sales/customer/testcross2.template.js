/*customer index template*/


const template = {
	properties: {
	},
	commands: {
	},
	events: {
		"Model.load":modelLoad
	}
};


function modelLoad() {
	console.dir(this.RepData);
	console.dir(this.RepData.$cross);
}

module.exports = template;

