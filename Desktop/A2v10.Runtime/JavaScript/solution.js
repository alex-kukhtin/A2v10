// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

(function () {

	const cats = {
		general: "Общие"
	};

	function createProp(mi, sprop) {
		switch (mi.type) {
			case "string":
				return sprop || '';
			case "enum":
				// TODO: check enum values
				return sprop || '';
			case "boolean":
				return sprop || false;
		}
		return null;
	}

	function copyProps(trg, src) {
		for (let p in trg._meta_) {
			let sprop = src[p];
			let mi = trg._meta_[p];
			trg[p] = createProp(mi, sprop);
		}
	}

	//*** Column
	function Column(src) {
		copyProps(this, src);
	}

	Column.prototype.type = "Column";
	Column.prototype._meta_ = {
		Name: {
			category: cats.general,
			type: "string",
			description: "Наименование колонки таблицы"
		},
		Unique: {
			category: cats.general,
			type: "boolean",
			description: "Только уникальные значения в колонке"
		}
	};

	//*** Table
	function Table(src) {
		copyProps(this, src);
		this.Columns = [];
		if (src.Columns)
			src.Columns.forEach(col => this.Columns.push(new Column(col)));
	}

	Table.prototype.type = "Table";
	Table.prototype._meta_ = {
		Name: {
			category: cats.general,
			type: "string",
			description: "Наименование таблицы"
		},
		UiName: {
			category: cats.general,
			type: "string",
			description: "Наименование таблицы (UI)"
		}
	};

	//*** View
	function View(src) {
		copyProps(this, src);
		this.Columns = [];
		if (src.Columns)
			src.Columns.forEach(col => this.Columns.push(new Column(col)));
	}

	View.prototype.type = "View";
	View.prototype._meta_ = {
		Name: {
			category: cats.general,
			type: "string",
			description: "Наименование представления"
		},
		UiName: {
			category: cats.general,
			type: "string",
			description: "Наименование представления (UI)"
		}
	};

	//** Module

	function Module() {

	}

	Module.prototype.type = "Module";
	Module.prototype._meta_ = {
		Name: {
			category: cats.general,
			readOnly: true,
			type: "string",
			description: "File name"
		},
		FullPath: {
			category: cats.general,
			readOnly: true,
			type: "string",
			description: "Specifies the full path to the file"
		}
	};

	function Solution(src) {
		copyProps(this, src);
		//console.log(src);
		this.Tables = [];
		this.Views = [];
		if (src.Tables)
			src.Tables.forEach(tbl => this.Tables.push(new Table(tbl)));
		if (src.Views)
			src.Views.forEach(view => this.Views.push(new View(view)));
	}

	Solution.prototype._meta_ = {
		Name: {
			category: cats.general,
			type: "string",
			description: "Наименование модуля (решения)"
		},
		Schema: {
			category: cats.general,
			type: "string",
			description: "Схема для этого модуля"
		}
	};

	function loadSolution(jsonText) {
		let source = JSON.parse(jsonText);
		this._root_ = new Solution(source);
		console.log(`solution loaded successfully`);
	}

	function saveSolution() {
		let source = this._root_;
		return JSON.stringify(source, (key, value) => key[0] === '_' ? undefined : value, 2);
	}

	function createSolution(name) {
		let ns = {
			Name: name,
			Schema: 'dbo',
			Tables: [],
			Views: []
		};
		return JSON.stringify(ns);
	}

	designer.solution.__loadSolution = loadSolution;
	designer.solution.__saveSolution = saveSolution;
	designer.solution.__createSolution = createSolution;

	designer.solution.__registerElement(View);
	designer.solution.__registerElement(Module);
})();


