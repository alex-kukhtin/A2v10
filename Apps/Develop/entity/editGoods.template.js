/**
 * edit good
 */


const template = {
	events: {
		"Model.load": modelLoad,
		"Entity.Name.change": nameChange,
		"Entity.Memo.change": memoChange
	},
	properties: {
		'TRoot.$RadioValue': String,
		'TRoot.$RadioSource': radioSource,
		'TRoot.$Date': Date,
		'TUnit.$Name'() { return `${this.Name} [${this.Short}]`;}
	},
	validators: {
		"Entity.Name": 'Введите наименование',
		"Entity.Article":
			{ valid: duplicateArticle, async: true, msg: "Товар с таким артикулом уже существует" },
		"Entity.Memo": [
			function (item, val) {
				console.log('function', this);
				return true; //{ msg: 'error from function', severity: 'info' };
			},
			{
				valid(item, val) {
					console.log('valid in object', this);
					return true; //{msg: 'error from object', severity:'info'};
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
	},
	commands: {
		fullScreen() {
			document.documentElement.requestFullscreen();
		},
		enterKey() {
			console.dir('enterKey');
		},
		testAccel() {
			alert('accel, id=' + this.Entity.Id);
		}
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

function nameChange(entity, name) {
	//this.$ctrl.$alert(name);
	console.dir('name change');
	this.$vm.$focus('memo-editor');
}


function memoChange(entity, memo) {
	console.dir(this.$ctrl.$focus);
	console.dir('memo change');
	this.$ctrl.$focus('name-editor');
}