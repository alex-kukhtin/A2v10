
let template = {
	events: {
		"Model.load": loaded,
		"guid.saved": saved
	}
};

module.exports = template;


function loaded() {
}

function saved(elem) {
	console.dir(elem);
	alert(elem.Item.Memo);
}