
/* element template */

const utils = require('std:utils');

let template = {
	properties: {
        "TRoot.Entity": { Id: 123, Name: 'entityName' },
        'Document.Sum': documentSumProperty,
        'TDocument.$browseAgentData'() {
            return { DocumentId: + this.Id };
        },
        "TDocument.$PaneStyle"() {
            return this.Rows.Count > 3 ? "warning" : null;
        }
	},
	methods: {
		// new
	},
	delegates: {
		FilterRows: filterRows
	},
	events: {
		// TODO:
        'Model.load'(root, caller) {
            //console.dir(caller);
			//alert(root.Document.DateCreated instanceof Date);
            root.Entity.Name = 'entity name after load';
		}
    },
    /*
		'Document.Company': 'Выберите продавца',
		'Document.Agent': 'Выберите покупателя',
		'Document.SNo': 'Введите номер документа',
		'Document.Rows[].Qty': 'Количество должно быть больше нуля',
		'Document.Rows[].Price': 'Цена должна быть больше нуля',
		'Document.Rows[].Sum': 'Сумма должна быть больше нуля'
    */
	validators: {
		'Document.Agent': 'Выберите покупателя',
    },
	commands: {
		add100rows(doc) {
			for (let i = 0; i < 100; i++)
				doc.Rows.$append();
        },
        Test: {
            checkReadOnly: true,
            canExec: canExecTest,
            exec: execTest
        },
        async StartProcess(doc) {
            const vm = this.$vm;
            let result = await vm.$invoke('startProcess', { Id: doc.Id });
            alert(utils.toJson(result));
            vm.$close();
        },
        async showEntityInfo() {
            const vm = this.$vm;
            let r = await vm.$invoke('testCommand', { Id: 123 });
            alert(1);
        }
    }
};


function execTest(arg) {
    alert(arg.Id);
}

function canExecTest(arg) {
    return true;
}
function documentSumProperty() {
	return this.Rows.reduce((prev, curr) => prev + curr.Qty, 0);
}

function filterRows(row, filter) {
	return row.Entity.Name.indexOf(filter.Filter) != -1;
}

module.exports = template;