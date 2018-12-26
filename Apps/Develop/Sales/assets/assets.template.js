/*invoice index template*/


const template = {
	properties: {
	},
	commands: {
		openDocument
	},
	delegates: {
		diagramByType
	}
};

module.exports = template;

function openDocument(doc) {
	alert(doc);
}

function diagramByType() {

}