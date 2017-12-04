
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
        },
        "TDocument.$Shipment": getShipment
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
    const root = this;
    const doc = root.Document;

    //doc.Rows[0].Entity.$set({ Name: 'Entity name' });
    doc.Rows[0].Entity = { Name: 'Entity name', Unit: {Id: 55, Name:'Unit'} };

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

function getShipment() {
    let doc = this;
    // все склады, которые есть в строках документа
    let wars = [];
    doc.Rows.forEach(row => {
        let whId = row.Warehouse.Id;
        if (!whId) return;
        if (wars.find(w => w.Ware.Id === whId)) return;
        wars.push({ Ware: row.Warehouse, Documents: [{ Id: 10, Name: 'Id=10' }, {Id:20, Name: 'Id=20'}] });
    });
    return wars;
}

module.exports = template;