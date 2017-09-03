
/* element template */

let template = {
	properties: {
		'Document.Sum': documentSumProperty
	},
	methods: {
		// new
	},
	delegates: {
		// new
	},
    events: {
    },
	validators: {
		'Document.SNo': 'Введите номер документа',
		'Document.Rows[].Qty': 'Количество должно быть больше нуля',
		'Document.Rows[].Price': 'Цена должна быть больше нуля',
		'Document.Rows[].Sum': 'Сумма должна быть больше нуля'
    },
	commands: {
		add100rows(doc) {
			for (let i = 0; i < 100; i++)
				doc.Rows.$append();
		}
    }
};


function documentSumProperty() {
	return this.Rows.reduce((prev, curr) => prev + curr.Qty, 0);
}

module.exports = template;