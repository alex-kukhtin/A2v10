// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20180114-7091*/
/* directives/focus.js */

Vue.directive('focus', {
	bind(el, binding, vnode) {

        function doSelect(event) {
            let t = event.target;
            if (t._selectDone)
                return;
            t._selectDone = true;
            if (t.select) t.select();
        }

		el.addEventListener("focus", function (event) {
            event.target.parentElement.classList.add('focus');
            setTimeout(() => {
                doSelect(event);
            }, 0);
		}, false);

		el.addEventListener("blur", function (event) {
			let t = event.target;
			t._selectDone = false;
			event.target.parentElement.classList.remove('focus');
		}, false);

        el.addEventListener("click", function (event) {
            doSelect(event);
        }, false);
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


Vue.directive('settabindex', {
    inserted(el) {
        if (el.tabIndex === 1) {
            setTimeout(() => {
                if (el.focus) el.focus();
            }, 0);
        }
    }
});
