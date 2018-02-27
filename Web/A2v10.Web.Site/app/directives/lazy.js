// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180227-7121*/
/* directives/lazy.js */

(function () {

	function updateLazy(arr) {
		if (arr && arr.$loadLazy) {
			arr.$loadLazy();
		}
	}

	Vue.directive('lazy', {
		componentUpdated(el, binding, vnode) {
			updateLazy(binding.value);
		},
		inserted(el, binding, vnode) {
			updateLazy(binding.value);
		}
	});
})();

