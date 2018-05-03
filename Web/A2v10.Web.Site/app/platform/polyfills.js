// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180502-7174
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
	}

	elem.scrollIntoViewCheck = elem.scrollIntoViewCheck || function () {
		let el = this;
		let elRect = el.getBoundingClientRect();
		let pElem = el.parentElement;
		while (pElem) {
			if (pElem.offsetHeight < pElem.scrollHeight)
				break;
			pElem = pElem.parentElement;
		}
		let parentRect = pElem.getBoundingClientRect();
		if (elRect.top < parentRect.top)
			el.scrollIntoView(true);
		else if (elRect.bottom > parentRect.bottom)
			el.scrollIntoView(false);
	}


})(Element.prototype);



