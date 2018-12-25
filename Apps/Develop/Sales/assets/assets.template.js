/*invoice index template*/


const template = {
	properties: {
	},
	commands: {
		openDocument
	}
};

module.exports = template;

function openDocument(doc) {
	alert(doc);
}