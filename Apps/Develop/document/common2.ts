﻿
import { TDocument } from "../sales/invoice/model";

/* document common module */


const utils = require('std:utils') as Utils;

const du = utils.date;
const cu = utils.currency;

const module = {
	// props
	docTotalSum,
	rowSum: { get: getRowSum, set: setRowSum },
	// events
	findArticle,
	documentCreate,
	applyDocument,
	// commands
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

export default module;

// document properties
function docTotalSum(this: TDocument): number {
	return this.Rows.reduce((prev, curr) => prev + curr.Sum, 0);
}


// document events
function findArticle(entity: any) {
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
	//vm.$invoke("nextDocNo", dat, '/Document').then(r => doc.No = r.Result.DocNo);
}

// document commands
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

// row properties
function getRowSum() {
	return cu.round(this.Price * this.Qty);
}

function setRowSum(value) {
	// ставим цену - сумма пересчитается
	if (this.Qty)
		this.Price = +(value / this.Qty).toFixed(2);
	else
		this.Pirce = 0;
}

