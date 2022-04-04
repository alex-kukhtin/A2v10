
let template = {
	events: {
		"Model.load": loaded,
		"guid.saved": saved,
		'from.dialog': fromChild
	}
};

module.exports = template;


function loaded() {
}

function saved(elem) {
	console.dir(elem);
	alert(elem.Item.Memo);
}

function fromChild(data, data2, data3) {
	alert(JSON.stringify(data));
	alert(data2 + data3);
}