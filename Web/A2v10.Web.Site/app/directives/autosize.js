// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

/*20190308-7461*/
/* directives/autosize.js */

Vue.directive('autoSize', {
	bind(el, binding, vnode) {
		if (!binding.value) return;

		el.style.overflowY = false;
		el._ops = {
			initHeight: -1,
			extraSpace: 0
		};

		el._autosize = function () {
			if (!el.offsetHeight)
				return;
			const ops = el._ops;
			if (ops.initHeight === -1) {
				ops.initHeight = el.offsetHeight;
			}
			el.style.height = ops.initHeight + "px";
			var needHeight = el.scrollHeight + ops.extraSpace;
			if (needHeight > ops.initHeight)
				el.style.height = needHeight + "px";
		};

		function onInput() {
			el._autosize();
		}

		function onAutoSize() {
			Vue.nextTick(() => el._autosize());
		}

		el.addEventListener("input", onInput);
		// Perhaps the value was set programmatically.
		el.addEventListener("autosize", onAutoSize);
	},

	inserted(el, binding) {
		if (!binding.value) return;
		let style = window.getComputedStyle(el);
		let es = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
		el._ops.extraSpace = es;
		setTimeout(() => el._autosize(), 1);
	}
});
