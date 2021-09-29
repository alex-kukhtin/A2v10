
let modeler = null;

const template = {
	events: {
		"Model.load": modelLoad
	}
};

module.exports = template;


function modelLoad() {
	setTimeout(() => {
		let builder = window.BpmnModeler;
		modeler = builder.create('canvas', 'js-properties-panel');
		modeler.importXML(builder.defaultXml);
	});
}

