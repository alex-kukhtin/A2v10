
let template = {
	properties: {
		'TRoot.Checked': Boolean
	},
	events: {
		"Model.load": loaded,
		"guid.saved": saved,
		'from.dialog': fromChild,
		'Items[].Checked.changing': itemChanging,
		'Root.Checked.changing' : rootChanging
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

function itemChanging(item, val) {
	console.log(item, val);
	debugger;
	return false;
}

function rootChanging(root, val) {
	setTimeout(() => {
		console.dir('update');
		console.dir(root.Checked);
		root.Checked = false;
	}, 100)
	return false;
}