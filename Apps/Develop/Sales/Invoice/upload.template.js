/*upload template*/

const template = {
	properties: {
	},
	delegates: {
		uploadFile
	}
};


function uploadFile(result) {
	console.dir(this);
	console.dir(result);
	let root = this.$root;
	root.$merge(result);
}

module.exports = template;

