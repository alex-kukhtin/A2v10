// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

// 20180110-7088
// services/datamodel.js


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
})(Element.prototype);



