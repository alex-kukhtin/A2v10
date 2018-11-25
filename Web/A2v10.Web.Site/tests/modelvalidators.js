
describe("ModelValidators", function () {
	const cmn = require('std:datamodel');
	const td = require('std:testdata');

	const docToTest = {
		Document: {
			Id: 55, Name: 'doc name', Rows: [
				{ Id: 100, Entity: { Id: 16, Name: 'Entity 16' } },
				{ Id: 101, Entity: { Id: 17, Name: 'Entity 17' } }
			]
		},
		Entities: [
			{ Id: 26, Name: 'Entity 26' },
			{ Id: 27, Name: 'Entity 27' }
		]
	};

	let templ = {
		validators: {
			'Document.Name': 'empty name',
			'Document.Rows[].Entity.Name': { valid: validEntity, msg: 'invalid entity', severity: 'warning'}
		}
	};

	function validEntity(ent) {
		return ent.Name === 'Valid entity';
	}

	it("simple validator", function () {

		let root = td.createDocument(docToTest, templ);
		let doc = root.Document;
		doc.Name = ''; // run validate
		let errs = doc.$errors('Name');
		let result = { msg: 'empty name', severity: 'error' };
		expect(errs.length).toBe(1);
		expect(errs[0]).toEqual(result);
	});

	it("row validator", function () {

		let root = td.createDocument(docToTest, templ);
		let ent = root.Document.Rows[0].Entity;
		ent.Name = ''; // run validate
		let errs = ent.$errors('Name');
		let result = { msg: 'invalid entity', severity: 'warning' };
		expect(errs.length).toBe(1);
		expect(errs[0]).toEqual(result);

		ent.Name = 'Valid entity';
		errs = ent.$errors('Name');
		expect(errs).toBe(null);
	});

});
