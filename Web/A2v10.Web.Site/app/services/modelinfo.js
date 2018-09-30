
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180930-7309
/* services/modelinfo.js */

app.modules['std:modelInfo'] = function () {

	return {
		copyfromQuery: copyFromQuery,
		get: getPagerInfo,
		reconcile: reconcile
	};

	function copyFromQuery(mi, q) {
		let psq = { PageSize: q.pageSize, Offset: q.offset, SortDir: q.dir, SortOrder: q.order };
		for (let p in psq) {
			mi[p] = psq[p];
		}
		if (mi.Filter) {
			for (let p in mi.Filter) {
				mi.Filter[p] = q[p];
			}
		}
	}

	function getPagerInfo(mi) {
		if (!mi) return undefined;
		let x = { pageSize: mi.PageSize, offset: mi.Offset, dir: mi.SortDir, order: mi.SortOrder };
		if (mi.Filter) {
			for (let p in mi.Filter) {
				x[p] = mi.Filter[p];
			}
		}
		return x;
	}

	function reconcile(mi) {
		if (!mi) return;
		if (!mi.Filter) return;
		for (let p in mi.Filter) {
			let fv = mi.Filter[p];
			if (typeof fv === 'string' && fv.startsWith('\"\\/\"')) {
				let dx = new Date(fv.substring(4, fv.length - 4));
				mi.Filter[p] = dx;
				//console.dir(mi.Filter[p]);
			}
		}
	}
};

