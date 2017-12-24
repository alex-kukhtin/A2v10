// Copyright © 2015-2017 Alex Kukhtin. All rights reserved.

/*20171224-7080*/
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

