
(function () {

    const cats = {
        general: "Общие"
    };

    function createProp(mi, sprop)
    {
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

    function Column(src) {
        copyProps(this, src);
    }

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

    function Table(src) {
        copyProps(this, src);
        this.Columns = [];
        if (src.Columns)
            src.Columns.forEach(col => this.Columns.push(new Column(col)));
	}

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

    function View(src) {
        copyProps(this, src);
        this.Columns = [];
        if (src.Columns)
            src.Columns.forEach(col => this.Columns.push(new Column(col)));
    }

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

    function Solution(src) {
        copyProps(this, src);
        console.log(src);
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

    designer.solution.__loadSolution = loadSolution;
    designer.solution.__saveSolution = saveSolution;

})();


