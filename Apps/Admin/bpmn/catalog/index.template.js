
let modeler = null;

const template = {
	commands: {
		upload
	}
};

module.exports = template;


async function upload() {
	const accept = 'text/plain';
	let result = await this.$ctrl.$upload('bpmn/catalog/uploadWorkflow', accept);
	console.dir(result);
}