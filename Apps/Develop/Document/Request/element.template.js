﻿
/* element template */

let template = {
	properties: {
        "TRoot.Entity": { Id: 123, Name: 'entityName' },
        'Document.Sum': documentSumProperty,
        'TDocument.$browseAgentUrl'() {
            return '/common/agent/browse?DocumentId=' + this.Id;
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
            canExec: canExecTest,
            exec: execTest
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