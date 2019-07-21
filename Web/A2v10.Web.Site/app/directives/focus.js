// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190721-7507*/
/* directives/focus.js */

Vue.directive('focus', {

	bind(el, binding, vnode) {

		// selects all text on focus

		function doSelect(t) {
			if (!t.select) return;
			if (t._selectDone) return;
			t.select();
			t._selectDone = true;
		}

		el.addEventListener("focus", function (event) {
			// focus occurs before click!
			event.target.parentElement.classList.add('focus');
			if (el.__opts && el.__opts.mask) return;
			let target = event.target;
			target._selectDone = false;
			setTimeout(() => {
				doSelect(target);
			}, 0);
		}, false);

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = true;
			t.parentElement.classList.remove('focus');
		}, false);

		el.addEventListener("click", function (event) {
			if (el.__opts && el.__opts.mask) return;
			doSelect(event.target);
		}, false);
	},

	inserted(el) {
		el._selectDone = false;
		if (el.tabIndex === 1) {
			setTimeout(() => {
				if (el.focus) el.focus();
				if (el.select) el.select();
			}, 0);
		}
	}
});


Vue.directive('settabindex', {
	inserted(el) {
		if (el.tabIndex === 1) {
			setTimeout(() => {
				if (el.focus) el.focus();
			}, 0);
		}
	}
});
