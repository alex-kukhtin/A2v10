define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils = require('std:utils');
    const du = utils.date;
    const cu = utils.currency;
    const module = {
        docTotalSum,
        rowSum: { get: getRowSum, set: setRowSum },
        findArticle,
        documentCreate,
        applyDocument,
        docApply: {
            saveRequired: true,
            validRequired: true,
            confirm: '@[Sure.ApplyDocument]',
            exec: applyDocument
        },
        docUnApply: {
            confirm: '@[Sure.UnApplyDocument]',
            exec: unApplyDocument
        }
    };
    exports.default = module;
    function docTotalSum() {
        return this.Rows.reduce((prev, curr) => prev + curr.Sum, 0);
    }
    function findArticle(entity) {
        const vm = entity.$vm;
        const row = entity.$parent;
        const dat = { Article: entity.Article };
        vm.$invoke('findArticle', dat, '/common/entity').then(r => {
            if ('Entity' in r)
                row.Entity = r.Entity;
            else
                row.Entity.$empty();
        });
    }
    function documentCreate(doc, kind) {
        const vm = doc.$vm;
        doc.Date = du.today();
        doc.Kind = kind;
        if (doc.Rows.$isEmpty)
            doc.Rows.$append();
        const dat = { Id: doc.Id, Kind: doc.Kind };
    }
    async function applyDocument(doc) {
        const vm = doc.$vm;
        await vm.$invoke('apply', { Id: doc.Id }, '/document');
        vm.$requery();
    }
    async function unApplyDocument(doc) {
        const vm = doc.$vm;
        await vm.$invoke('unApply', { Id: doc.Id }, '/document');
        vm.$requery();
    }
    function getRowSum() {
        return cu.round(this.Price * this.Qty);
    }
    function setRowSum(value) {
        if (this.Qty)
            this.Price = +(value / this.Qty).toFixed(2);
        else
            this.Pirce = 0;
    }
});
