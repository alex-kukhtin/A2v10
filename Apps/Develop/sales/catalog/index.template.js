
const template = {
	properties: {
		'TRoot.$QueryText': String,
		"TRoot.$QueryString": queryString
	}
}

function queryString() {
	let root = this;

	return { Name: root.$QueryText, Code: '22' };
}

module.exports = template;