// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20240111-7956
// platform/polyfills.js


(function (elem) {
	elem.closest = elem.closest || function (css) {
		let node = this;
		while (node) {
			if (node.matches(css))
				return node;
			else
				node = node.parentElement;
		}
		return null;
	};

	elem.scrollIntoViewCheck = elem.scrollIntoViewCheck || function () {
		let el = this;
		let elRect = el.getBoundingClientRect();
		let pElem = el.parentElement;
		while (pElem) {
			if (pElem.offsetHeight < pElem.scrollHeight)
				break;
			pElem = pElem.parentElement;
		}
		if (!pElem)
			return;
		let parentRect = pElem.getBoundingClientRect();
		if (elRect.top < parentRect.top) {
			//pElem.scrollTop -= parentRect.top - elRect.top + 1;
			//el.scrollIntoView(true);
			el.scrollIntoView({ block: 'nearest' });
		}
		else if (elRect.bottom > parentRect.bottom) {
			//pElem.scrollTop += elRect.bottom - parentRect.bottom + 1;
			el.scrollIntoView({ block: 'nearest' });
			//el.scrollIntoView(false);
		}
	};


})(Element.prototype);

(function (date) {

	let td = new Date(0, 0, 1, 0, 0, 0, 0);

	date.isZero = date.isZero || function () {
		return this.getTime() === td.getTime();
	};

	date.toJSON = function (key) {
		let nd = new Date(this);
		let ds = 0;
		if (nd.getFullYear() < 1925) {
			ds = -4;
		}
		nd.setHours(nd.getHours(), nd.getMinutes() - nd.getTimezoneOffset(), nd.getSeconds() - ds, 0);
		return nd.toISOString().replace('Z', '');
	};

})(Date.prototype);



