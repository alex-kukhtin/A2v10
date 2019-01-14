// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190114-7412/
/* directives/pageorient.js */


(function () {

	const pageStyle = Symbol();

	Vue.directive('page-orientation', {
		bind(el, binding) {
			let style = document.createElement('style');
			style.innerHTML = `@page {size: A4 ${binding.value}; margin:1cm;}`;
			document.head.appendChild(style);
			el[pageStyle] = style;
		},

		unbind(el) {
			let style = el[pageStyle];
			if (style) {
				document.head.removeChild(style);
			}
		}
	});
})();