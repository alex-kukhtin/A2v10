/*customer index template*/


const template = {
	properties: {
		"TDataArray.$CrossSpan"() {
			return this.$cross.Cross1.length * 2 + 1;
		},
		"TData.$CrossTotal"() {
			return this.Cross1.reduce((p, c) => p + c.Val, 0);
		}
	},
	commands: {
	},
	events: {
		"Model.load":modelLoad
	}
};


function modelLoad() {
	console.dir(this.RepData);
}

module.exports = template;

