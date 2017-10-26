/*20171026-7056*/
/* directives/focus.js */

Vue.directive('focus', {
	bind(el, binding, vnode) {

		el.addEventListener("focus", function (event) {
			event.target.parentElement.classList.add('focus');
		});

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = false;
			event.target.parentElement.classList.remove('focus');
		});

		el.addEventListener("click", function (event) {
			let t = event.target;
			if (t._selectDone)
				return;
			t._selectDone = true;
			if (t.select) t.select();
			//event.stopImmediatePropagation();
        }, true);
    },
    inserted(el) {
        if (el.tabIndex === 1) {
            setTimeout(() => {
                if (el.focus) el.focus();
                if (el.select) el.select();
            }, 0);
        }
    }
});

