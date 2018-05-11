
// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180511-7186*/
/* services/modelinfo.js */

app.modules['std:modelInfo'] = function () {

	return {
		copyfromQuery: copyFromQuery,
		get: getPagerInfo
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
		if (mi.Filter)
			for (let p in mi.Filter) {
				let fVal = mi.Filter[p];
				if (!fVal) continue; // empty value, skip it
				x[p] = fVal;
			}
		return x;
	}
};

