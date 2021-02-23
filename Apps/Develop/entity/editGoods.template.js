/**
 * edit good
 */


const template = {
	events: {
		"Model.load": modelLoad
	},
	properties: {
		'TRoot.$RadioValue': String,
		'TRoot.$RadioSource': radioSource,
		'TRoot.$Date': Date
	},
	validators: {
		"Entity.Name": 'Введите наименование',
		"Entity.Article":
			{ valid: duplicateArticle, async: true, msg: "Товар с таким артикулом уже существует" },
		"Entity.Memo": [
			function (item, val) {
				console.log('function', this);
				return { msg: 'error from function', severity: 'info' };
			},
			{
				valid(item, val) {
					console.log('valid in object', this);
					return {msg: 'error from object', severity:'info'};
				},
				applyIf(item, val) {
					console.log('applyIf', this);
					return true;
				}
			}
		]
	},
	delegates: {
		onFileUpload
	}
};


function radioSource() {
	return [{ Name: 'Radio 0', Value:'0'}, { Name: 'Radio1', Value: '1' }, { Name: 'Radio 2', Value: '2' }];
}

function modelLoad(root) {
	const ent = root.Entity;
	if (ent.$isNew)
		entityCreate(ent);
}

function entityCreate(ent) {
	ent.Kind = 'Goods';
}

function duplicateArticle(entity, article) {
	console.log('async function', this);
	var vm = entity.$vm;
	if (!entity.Article)
		return true;
	return vm.$asyncValid('duplicateArticle', { Article: entity.Article, Id: entity.Id });
}

module.exports = template;

function onFileUpload(result) {
	let itm = result[0];
	console.dir(itm);
	this.Entity.Image = itm.Id;
	this.Entity.Token = itm.Token;
}